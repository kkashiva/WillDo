// new swimlane modal
const newSwimlaneBtn = document.querySelector(".addSwimlaneBtn");
const newSwimlaneBtn2 = document.querySelector(".addSwimlaneBtn2");
const newSwimlaneModal = document.querySelector(".newSwimlaneModal");
newSwimlaneBtn.addEventListener("click", (ev) => {
  newSwimlaneModal.showModal();
});
newSwimlaneBtn2.addEventListener("click", (ev) => {
  newSwimlaneModal.showModal();
});

// new board modal
const newBoardBtn = document.querySelector(".newBoardBtn");
const newBoardModal = document.querySelector(".newBoardModal");
newBoardBtn.addEventListener("click", (ev) => {
  newBoardModal.showModal();
});

// new task modal
const newTaskBtn = document.querySelector(".addTaskBtn");
const newTaskModal = document.querySelector(".newTaskModal");
newTaskBtn.addEventListener("click", (ev) => {
  newTaskModal.showModal();
});

// close modals
const closeModalButtons = document.querySelectorAll(".closeModal");
closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    event.stopPropagation(); // Prevent the event from bubbling up to the parent element
    const modal = button.closest(".modal");
    modal.close();
  });
});

// delete board confirmation
const deleteBoard = document.querySelector(".deleteBoard");
const deleteModal = document.querySelector(".deleteModal");
deleteBoard.addEventListener("click", () => {
  deleteModal.showModal();
});

// delete swimlane confirmation
const deleteCol = document.querySelectorAll(".deleteCol");

deleteCol.forEach((item) => {
  item.addEventListener("click", (ev) => {
    ev.preventDefault(); // Prevent the default anchor action

    const swimlaneId = item.getAttribute("data-id");

    let modal = document.querySelector(`.deleteColumnModal[data-id="${swimlaneId}"]`);
    modal.showModal();
  });
});

// edit board modal
const editBoardBtn = document.querySelector(".editBoard");
const editBoardModal = document.querySelector(".editBoardModal");

editBoardBtn.addEventListener("click", () => {
  editBoardModal.showModal();
});

// edit swimlane modal
const editSwimlaneBtn = document.querySelectorAll(".editSwimlaneBtn");
const editSwimlaneModal = document.querySelector(".editSwimlaneModal");

editSwimlaneBtn.forEach((item) => {
  item.addEventListener("click", (ev) => {
    ev.preventDefault(); // Prevent the default anchor action

    const swimlaneId = item.getAttribute("data-id");

    let modal = document.querySelector(`.editSwimlaneModal[data-id="${swimlaneId}"]`);
    modal.showModal();
  });
});

// edit task modal
const editTaskBtn = document.querySelectorAll(".editTaskBtn");
const editTaskModal = document.querySelector(".editTaskModal");

editTaskBtn.forEach((item) => {
  item.addEventListener("click", (ev) => {
    // ev.preventDefault(); // Prevent the default anchor action

    const taskId = item.getAttribute("data-id");

    let modal = document.querySelector(`.editTaskModal[data-id="${taskId}"]`);
    modal.showModal();
  });
});

// edit task modal on clicking task card
const taskCard = document.querySelectorAll(".taskCard");

taskCard.forEach((item) => {
  item.addEventListener("click", (ev) => {
    // ev.preventDefault(); // Prevent the default anchor action

    // Check if the event target or any of its parents should not trigger the modal
    if (!ev.target.closest(".celebrate-btn, .delete-task-btn, .closeModal, .checkbox-btn, .timeboxLabel, .timeboxCheckbox")) {
      const taskId = item.getAttribute("data-id");
      let modal = document.querySelector(`.editTaskModal[data-id="${taskId}"]`);
      modal.showModal();
    }
  });
});

// toggling the conditional timebox elements
document.addEventListener("DOMContentLoaded", function () {
  // Function to toggle the 'hidden' class based on the checkbox state
  function toggleTimeboxElements(checkbox) {
    const timeboxElements = checkbox.closest(".checkbox-btn").nextElementSibling;
    if (checkbox.checked) {
      timeboxElements.classList.remove("hidden");
    } else {
      timeboxElements.classList.add("hidden");
    }
  }

  // Select all checkboxes
  const checkboxes = document.querySelectorAll(".timeboxCheckbox");

  // Set the initial state
  checkboxes.forEach((checkbox) => {
    toggleTimeboxElements(checkbox);

    // Add event listener for click events
    checkbox.addEventListener("change", function () {
      toggleTimeboxElements(checkbox);
    });
    // Add event listener for checkbox-btn click events
    const checkboxBtn = checkbox.closest(".checkbox-btn");
    checkboxBtn.addEventListener("click", function (event) {
      if (event.target !== checkbox) {
        // Avoid toggling when clicking directly on the checkbox
        checkbox.checked = !checkbox.checked;
        toggleTimeboxElements(checkbox);
      }
    });
  });
});

// listener for addToCalendar button click
// document.getElementById("addToCalendar").addEventListener("click", function () {
//   const taskId = document.getElementById("taskId").value;
//   const swimlaneId = document.getElementById("swimlaneId").value;
//   const boardId = document.getElementById("boardId").value;
//   const title = document.getElementById("title").value;
//   const description = document.getElementById("description").value;
//   const priority = document.getElementById("priority").value;
//   const dueDate = document.getElementById("dueDate").value;
//   const timebox = document.getElementById("timebox").value;
//   const timeboxDuration = document.getElementById("timeboxDuration").value;
//   const timeboxStart = document.getElementById("timeboxStart").value;

//   const data = {
//     taskId,
//     swimlaneId,
//     boardId,
//     title,
//     description,
//     priority,
//     dueDate,
//     timebox,
//     timeboxDuration,
//     timeboxStart,
//   };

//   fetch("/bookTime", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("Success:", data);
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// });
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".addToCalendar").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const form = event.target.closest(".taskForm");
      const formData = new FormData(form);

      const data = {
        taskId: formData.get("taskId"),
        swimlaneId: formData.get("swimlaneId"),
        boardId: formData.get("boardId"),
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        dueDate: new Date(formData.get("dueDate")).toISOString(),
        timebox: formData.get("timebox"),
        timeboxDuration: formData.get("timeboxDuration"),
        timeboxStart: new Date(formData.get("timeboxStart")).toISOString(),
      };

      fetch("/bookTime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });
});
