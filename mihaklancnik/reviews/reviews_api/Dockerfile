# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 2000 for the application
EXPOSE 2000

# Run the application with Uvicorn on port 2000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "2000", "--reload"]