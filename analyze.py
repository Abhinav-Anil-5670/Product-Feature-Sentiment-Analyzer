# pip install spacy pandas vaderSentiment
# python3 -m spacy download en_core_web_sm

import spacy
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import json
import re

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model 'en_core_web_sm' not found.")
    print("Please run: python -m spacy download en_core_web_sm")
    exit()

analyzer = SentimentIntensityAnalyzer()

def extract_aspects(doc):
    results = []
    # Use a set to keep track of aspects we've already found and scored in a sentence
    # to avoid duplicate entries for the same core idea.
    processed_sentences = {}

    # --- NEW: PATTERN 3 for handling negation directly ---
    for token in doc:
        if token.dep_ == 'neg': # Found a negation word (e.g., "not")
            verb = token.head
            # Find the subject (aspect) and description (opinion) linked to the verb
            aspect = None
            opinion = None
            for child in verb.children:
                if child.dep_ in ('nsubj', 'nsubjpass'): # nominal subject
                    aspect = child.text.lower()
                elif child.dep_ == 'acomp': # adjectival complement
                    opinion = child.text.lower()
            
            if aspect and opinion and verb.sent not in processed_sentences:
                sentence = verb.sent.text
                vs = analyzer.polarity_scores(sentence)
                sentiment = get_sentiment_label(vs['compound'])
                results.append({
                    "aspect": aspect, 
                    "opinion": opinion, # The word itself
                    "context": sentence, # The full context analyzed
                    "sentiment": sentiment, 
                    "score": vs['compound']
                })
                processed_sentences[verb.sent] = True

    for token in doc:
        # If we've already processed this sentence via the negation rule, skip it
        if token.sent in processed_sentences:
            continue

        # PATTERN 1: Adjective directly modifying a noun (e.g., "good money")
        if token.dep_ == 'amod' and token.head.pos_ == 'NOUN':
            aspect = token.head.text.lower()
            opinion = token.text.lower()
            
            # THE FIX: Analyze the entire sentence for context
            sentence = token.sent.text
            vs = analyzer.polarity_scores(sentence)
            sentiment = get_sentiment_label(vs['compound'])
            results.append({
                "aspect": aspect, 
                "opinion": opinion, 
                "context": sentence,
                "sentiment": sentiment, 
                "score": vs['compound']
            })
            processed_sentences[token.sent] = True


        # PATTERN 2: Noun as subject of a descriptive verb (e.g., "show was terrible")
        elif token.dep_ == 'nsubj' and token.head.pos_ in ['VERB', 'AUX']:
            for child in token.head.children:
                if child.dep_ == 'acomp':
                    aspect = token.text.lower()
                    opinion = child.text.lower()
                    
                    # THE FIX: Analyze the entire sentence for context
                    sentence = token.sent.text
                    vs = analyzer.polarity_scores(sentence)
                    sentiment = get_sentiment_label(vs['compound'])
                    results.append({
                        "aspect": aspect, 
                        "opinion": opinion, 
                        "context": sentence,
                        "sentiment": sentiment, 
                        "score": vs['compound']
                    })
                    processed_sentences[token.sent] = True

    # Fallback to noun chunks if no specific patterns are found
    if not results:
        for chunk in doc.noun_chunks:
            if chunk.root.pos_ != 'PRON':
                vs = analyzer.polarity_scores(chunk.sent.text)
                # Only add if the sentiment is not neutral
                if vs['compound'] != 0:
                    sentiment = get_sentiment_label(vs['compound'])
                    results.append({
                        "aspect": chunk.text.lower(), 
                        "opinion": "N/A",
                        "context": chunk.sent.text,
                        "sentiment": sentiment, 
                        "score": vs['compound']
                    })

    # A final step to remove duplicates that might have slipped through
    final_results = [dict(t) for t in {tuple(d.items()) for d in results}]
    return final_results

def get_sentiment_label(score):
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

def clean_text(text):
    text = re.sub(r'([.!?])([A-Za-z])', r'\1 \2', text)
    return text

def process_dataset(input_csv_path, output_csv_path, review_column_name='review', batch_size=500):
    print(f"Starting dataset processing from '{input_csv_path}'...")
    try:
        chunk_iterator = pd.read_csv(input_csv_path, chunksize=batch_size, on_bad_lines='skip')
        
        is_first_batch = True
        
        for i, chunk in enumerate(chunk_iterator):
            print(f"Processing batch {i+1}...")
            
            if review_column_name not in chunk.columns:
                print(f"Error: Column '{review_column_name}' not found.")
                return

            reviews = chunk[review_column_name].fillna('').astype(str)
            
            # Clean the text before processing
            cleaned_reviews = [clean_text(review) for review in reviews]
            
            docs = nlp.pipe(cleaned_reviews)
            
            analysis_results = [json.dumps(extract_aspects(doc)) for doc in docs]
            
            chunk['aspect_sentiments'] = analysis_results
            
            if is_first_batch:
                chunk.to_csv(output_csv_path, index=False, mode='w')
                is_first_batch = False
            else:
                chunk.to_csv(output_csv_path, index=False, mode='a', header=False)

        print(f"Processing complete. Results saved to '{output_csv_path}'.")

    except FileNotFoundError:
        print(f"Error: The file '{input_csv_path}' was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    input_file = "TestReviews.csv"
    output_file = "results.csv" 

    process_dataset(input_file, output_file, review_column_name='review')