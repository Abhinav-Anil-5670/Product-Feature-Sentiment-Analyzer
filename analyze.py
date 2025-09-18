# pip install spacy
# pip install vaderSentiment
# pip install pandas
# python -m spacy download en_core_web_sm

import spacy
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import csv
import os

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model 'en_core_web_sm' not found.")
    print("Please run: python -m spacy download en_core_web_sm")
    exit()

analyzer = SentimentIntensityAnalyzer()

# passing a single review to this
# outputs the dict [aspect, sentiment]
def aspect_based_sentiment_analysis(review_text):
    doc = nlp(review_text)
    results = []
    
    # Using nouns as aspects
    aspects = [chunk.text.lower() for chunk in doc.noun_chunks]
    
    unique_aspects = list(set(aspects))

    if not unique_aspects:
        unique_aspects = [token.text.lower() for token in doc if token.pos_ == "NOUN"]
        if not unique_aspects:
             return []

    for aspect in unique_aspects:
        sentiment_scores = []
        
        # Find sentences containing the aspect
        for sent in doc.sents:
            if aspect in sent.text.lower():
                # Get the sentiment of the sentence
                vs = analyzer.polarity_scores(sent.text)
                sentiment_scores.append(vs['compound'])

        if sentiment_scores:
            avg_score = sum(sentiment_scores) / len(sentiment_scores)

            if avg_score >= 0.05:
                sentiment = "Positive"
            elif avg_score <= -0.05:
                sentiment = "Negative"
            else:
                sentiment = "Neutral"

            results.append({"aspect": aspect, "sentiment": sentiment, "score": round(avg_score, 2)})

    return results

# reads from the input csv
# writes to output csv
# for each review calls aspect_based_sentiment_analysis(review_text)
def process_dataset(input_csv_path, output_csv_path):
    review_column_name = 'review'
    print(f"Starting dataset processing from '{input_csv_path}'...")
    try:
        with open(input_csv_path, mode='r', encoding='utf-8') as infile, \
             open(output_csv_path, mode='w', encoding='utf-8', newline='') as outfile:
            
            reader = csv.DictReader(infile)
            
            # Verify the review column exists
            if review_column_name not in reader.fieldnames:
                print(f"Error: Column '{review_column_name}' not found in '{input_csv_path}'.")
                print(f"Available columns: {', '.join(reader.fieldnames)}")
                return

            # Prepare the output file with headers
            # It will include all original columns plus the analysis columns
            output_headers = reader.fieldnames + ['aspect', 'sentiment', 'score']
            writer = csv.DictWriter(outfile, fieldnames=output_headers)
            writer.writeheader()

            for row in reader:
                review_text = row.get(review_column_name, "")
                
                if not review_text or not review_text.strip():
                    continue

                analysis_results = aspect_based_sentiment_analysis(review_text)

                if analysis_results:
                    for result in analysis_results:
                        new_row = row.copy()
                        new_row['aspect'] = result['aspect']
                        new_row['sentiment'] = result['sentiment']
                        new_row['score'] = result['score']
                        writer.writerow(new_row)
                else:
                    new_row = row.copy()
                    new_row['aspect'] = 'N/A'
                    new_row['sentiment'] = 'N/A'
                    new_row['score'] = 0.0
                    writer.writerow(new_row)
        
        print(f"✔ Processing complete. Results saved to '{output_csv_path}'.")

    except FileNotFoundError:
        print(f"Error: The file '{input_csv_path}' was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    input_file = "TestReviews.csv"
    output_file = "results.csv"

    process_dataset(input_file, output_file)