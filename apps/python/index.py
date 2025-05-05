from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from datasets import load_dataset
from sklearn.preprocessing import LabelEncoder
import torch

dataset = load_dataset("csv", data_files="emails.csv")

model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=5)

label_encoder = LabelEncoder()
label_encoder.fit(dataset["train"]["label"])


def preprocess(data):
    data["label"] = label_encoder.transform(data["label"])  # encode the labels
    return tokenizer(data["email_text"], truncation=True, padding="max_length")


tokenized = dataset.map(preprocess, batched=True)

training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=4,
    weight_decay=0.01,
)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized["train"],
)

# Start training
trainer.train()

# Save the model
model.save_pretrained("./email_classifier_model")
tokenizer.save_pretrained("./email_classifier_model")
