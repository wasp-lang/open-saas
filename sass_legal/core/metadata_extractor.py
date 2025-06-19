import spacy
import re

# Load the French NLP model
# We try to load the model here. If it fails, it means the user has not
# downloaded it. We print a message and exit.
try:
    nlp = spacy.load("fr_core_news_sm")
except OSError:
    print(
        "Missing spaCy model. Please run: python -m spacy download fr_core_news_sm"
    )
    nlp = None # Or handle more gracefully

def extract_metadata_from_text(text_content):
    """
    Extracts metadata (dates, persons, organizations, law articles) from text.

    Args:
        text_content (str): The text content to process.

    Returns:
        dict: A dictionary containing extracted metadata.
              Keys: "dates", "persons", "organizations", "law_articles"
    """
    if nlp is None:
        return {
            "dates": [],
            "persons": [],
            "organizations": [],
            "law_articles": [],
            "error": "spaCy model not loaded. Please run: python -m spacy download fr_core_news_sm"
        }

    doc = nlp(text_content)

    metadata = {
        "dates": [],
        "persons": [],
        "organizations": [],
        "law_articles": []
    }

    for ent in doc.ents:
        if ent.label_ == "DATE":
            metadata["dates"].append(ent.text)
        elif ent.label_ == "PER":
            metadata["persons"].append(ent.text)
        elif ent.label_ == "ORG":
            metadata["organizations"].append(ent.text)

    # Extract law articles using regular expressions
    metadata["law_articles"] = _extract_law_articles(text_content)

    # Remove duplicates
    for key in metadata:
        metadata[key] = sorted(list(set(metadata[key])))

    return metadata

def _extract_law_articles(text_content):
    """
    Extracts law article numbers using regular expressions.
    This is a basic example and might need to be adjusted for specific formats.
    """
    # Regex to find patterns like "article L. 123-45", "article R123-45", "l'article 123"
    # It looks for "article" (optionally preceded by "l'")
    # Revised simplified patterns
    list_articles_pattern_str = r"(?i)(?:\b\w+\s+)?articles\s+([\w\d,\s]+(?:et\s+[\w\d]+)?)"
    patterns = [
        # Articles like L. 123-45, R. 123-1, article 123, l'article L3, article 4b
        # Fixed: (?:-\w\d+)* to (?:-[\w\d]+)*
        r"(?:\b\w+\s+)?[Ll]['’\s]article[s]?\s+((?:[A-Z]\.\s*)?[\w\d]+(?:-[\w\d]+)*)",
        r"(?:\b\w+\s+)?article[s]?\s+((?:[A-Z]\.\s*)?[\w\d]+(?:-[\w\d]+)*)",

        # loi n°, décret n°
        r"(loi\s+n°\s*[\d-]+)",
        r"(décret\s+n°\s*[\d-]+)",

        # Handling "articles X et Y" or "articles X, Y, Z" - this is a dedicated pattern
        list_articles_pattern_str,

        # References to Codes - kept simple
        r"(code\s+de\s+l['’\s][\w\s]+)", # e.g., code de l'environnement
        r"(Code\s+[\w\s]+)" # e.g., Code civil
    ]

    found_articles_parts = []
    for pattern_str in patterns:
        for match in re.finditer(pattern_str, text_content): # IGNORECASE is in list_articles_pattern_str
            captured_text = None
            if len(match.groups()) > 0:
                captured_text = match.group(1).strip()
            else:
                continue # Should not happen if all patterns have a capture group

            if not captured_text:
                continue

            # Special processing for the list_articles_pattern
            if pattern_str == list_articles_pattern_str:
                # captured_text will be like "1, 2 et 3" or "10 et 11" or "L1, L2 et L3"
                # Extract individual article numbers/codes
                individual_articles = re.findall(r'[\w\d]+', captured_text) # Find all alphanumeric sequences
                for art_num_candidate in individual_articles:
                    # Filter out common words that are not articles if they appear alone
                    if art_num_candidate.lower() not in ["et", "articles", "les", "l", "sont", "des", "est", "important", "importants"]:
                        found_articles_parts.append(art_num_candidate)
            else:
                found_articles_parts.append(captured_text)

    # Remove duplicates and sort
    unique_articles = sorted(list(set(filter(None, found_articles_parts))))
    return unique_articles

if __name__ == '__main__':
    # Example Usage (optional - for testing)
    sample_text_french = """
    Le présent document a été signé le 15 janvier 2023 par Jean Dupont de la société ACME Corp.
    Conformément à l'article L. 123-45 du Code du Travail et la loi n°2004-575.
    L'article R. 111-1 et l'article R. 111-2 sont aussi applicables.
    Voir aussi le décret n° 2000-123. Le Code de commerce est important.
    Signé par Marie Curie pour Générale Électrique. La date limite est le 31 décembre 2024.
    """

    if nlp:
        print("--- French Example ---")
        metadata_french = extract_metadata_from_text(sample_text_french)
        print(f"Texte: {sample_text_french[:100]}...")
        print(f"Métadonnées: {metadata_french}\n")

    sample_text_no_law = "Ceci est un texte simple sans référence légale, signé par Personne Lambda le 1er avril 2025."
    if nlp:
        print("--- No Law Example ---")
        metadata_no_law = extract_metadata_from_text(sample_text_no_law)
        print(f"Texte: {sample_text_no_law[:100]}...")
        print(f"Métadonnées: {metadata_no_law}\n")

    sample_text_edge_cases = "L'article 1, l'article 2, et l'article L3. Article 4b et Article 5 C. Article L.123-1 du code de l'urbanisme."
    if nlp:
        print("--- Edge Case Law Articles ---")
        metadata_edge = extract_metadata_from_text(sample_text_edge_cases)
        print(f"Texte: {sample_text_edge_cases[:100]}...")
        print(f"Métadonnées (law articles only): {metadata_edge['law_articles']}\n")

    # Test what happens if the model is not loaded
    # nlp = None
    # metadata_error = extract_metadata_from_text(sample_text_french)
    # print(f"Error case: {metadata_error}")
