document.addEventListener("DOMContentLoaded", () => {
    // Unregister participant from activity
    async function unregisterParticipant(activityName, participantEmail) {
      try {
      const url = `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`;
      console.log("Unregistering participant from:", url);
      console.log("Activity:", activityName, "Email:", participantEmail);
      
      const response = await fetch(url, {
        method: "POST",
      });
      
      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response result:", result);
      
      if (response.ok) {
        messageDiv.textContent = result.message || "Participant removed.";
        messageDiv.className = "success";
        fetchActivities(); // Refresh activities list
      } else {
        messageDiv.textContent = result.detail || "Failed to remove participant.";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
      } catch (error) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
      }
    }
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        participantsSection.innerHTML = `<strong>Participants:</strong>`;
        if (details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          ul.style.listStyleType = "none";
          ul.style.paddingLeft = "0";
          details.participants.forEach(participant => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";

            // Participant name
            const span = document.createElement("span");
            span.textContent = participant;
            li.appendChild(span);

            // Delete icon
            const deleteIcon = document.createElement("span");
            deleteIcon.innerHTML = "&#128465;"; // Trash can emoji
            deleteIcon.title = "Remove participant";
            deleteIcon.style.cursor = "pointer";
            deleteIcon.style.marginLeft = "8px";
            deleteIcon.addEventListener("click", () => {
              unregisterParticipant(name, participant);
            });
            li.appendChild(deleteIcon);

            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          const noParticipants = document.createElement("p");
          noParticipants.className = "no-participants";
          noParticipants.textContent = "No participants yet.";
          participantsSection.appendChild(noParticipants);
        }
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
