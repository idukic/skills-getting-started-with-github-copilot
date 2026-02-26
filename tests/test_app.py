"""
Backend FastAPI tests for src/app.py
All tests use the Arrange-Act-Assert (AAA) pattern:
- Arrange: Set up test client and data
- Act: Make API requests
- Assert: Check responses and side effects
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure src is in sys.path for import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
import app

client = TestClient(app.app)

def setup_function():
    # Reset activities before each test
    for activity in app.activities.values():
        participants = activity["participants"]
        participants.clear()
        # Restore initial participants for each activity
    app.activities["Chess Club"]["participants"] = ["michael@mergington.edu", "daniel@mergington.edu"]
    app.activities["Programming Class"]["participants"] = ["emma@mergington.edu", "sophia@mergington.edu"]
    app.activities["Gym Class"]["participants"] = []
    app.activities["Basketball Team"]["participants"] = ["james@mergington.edu"]
    app.activities["Tennis Club"]["participants"] = ["isabella@mergington.edu", "lucas@mergington.edu"]
    app.activities["Art Studio"]["participants"] = ["grace@mergington.edu"]
    app.activities["Drama Club"]["participants"] = ["henry@mergington.edu", "amelia@mergington.edu"]
    app.activities["Debate Team"]["participants"] = ["alexander@mergington.edu"]
    app.activities["Science Club"]["participants"] = ["mia@mergington.edu", "ethan@mergington.edu"]

def test_signup_success():
    # Arrange
    activity = "Gym Class"
    email = "newstudent@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity}"
    assert email in app.activities[activity]["participants"]

def test_signup_activity_not_found():
    # Arrange
    activity = "Nonexistent Club"
    email = "student@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_signup_already_signed_up():
    # Arrange
    activity = "Chess Club"
    email = "michael@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"

def test_signup_activity_full():
    # Arrange
    activity = "Tennis Club"
    # Fill up the activity
    app.activities[activity]["participants"] = [f"student{i}@mergington.edu" for i in range(app.activities[activity]["max_participants"])]
    email = "extrastudent@mergington.edu"
    # Act
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Activity is full"
