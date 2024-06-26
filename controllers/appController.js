const User = require("../models/users");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {google} = require('googleapis');
const express = require('express');
const session = require('express-session');


// Go to app page
module.exports.getApp = (req, res, next) => {
  const fullName = req.user.name;
  const firstName = fullName.split(" ")[0];
  const totalTasks = req.user.totalTasks;
  const deletedTasks = req.user.deletedTasks;
  const currentTasks = totalTasks - deletedTasks;
  let completionRate = (deletedTasks / totalTasks) * 100;
  if (isNaN(completionRate) || completionRate === Infinity || completionRate === -Infinity) {
    completionRate = 0;
  } else {
    completionRate = Math.round(completionRate); // Round to the nearest integer
  }

  res.render("./app/app", {
    user: req.user,
    firstName,
    currentTasks,
    totalTasks,
    deletedTasks,
    completionRate,
  });
};

// Logout
module.exports.getLogout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

// Create a new board
module.exports.postNewBoard = async (req, res, next) => {
  const { title } = req.body;

  try {
    let user = await User.findById(req.user._id);
    user.boards.push({ title });
    user.save();
    let newBoard = user.boards[user.boards.length - 1];
    res.redirect("/app/board?boardId=" + newBoard._id);
  } catch (err) {
    res.render("error", { err });
  }
};

// Edit a board name
module.exports.postEditBoard = async (req, res, next) => {
  const { title, boardId } = req.body;

  try {
    let user = await User.findById(req.user._id);

    let board = user.boards.id(boardId);
    board.title = title;
    user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// Go to any Board page
module.exports.getBoard = async (req, res, next) => {
  const { boardId } = req.query;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    if (!board) {
      throw new Error("Board not found");
    }
    res.render("./app/board", {
      board,
      user: req.user,
    });
  } catch (err) {
    res.render("error", { err });
  }
};

// Create a new swimlane
module.exports.postNewSwimlane = async (req, res, next) => {
  const { boardId, title, statusColor } = req.body;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    if (!board) {
      throw new Error("Board not found");
    }
    board.swimlanes.push({ title, statusColor });
    user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// Edit swimlane
module.exports.postEditSwimlane = async (req, res, next) => {
  const { swimlaneId, boardId, title, statusColor } = req.body;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    let swimlane = board.swimlanes.id(swimlaneId);
    swimlane.title = title;
    swimlane.statusColor = statusColor;
    user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// Create a new task
module.exports.postNewTask = async (req, res, next) => {
  const { boardId, title, description, status, priority, dueDate } = req.body;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);

    if (!board) {
      throw new Error("Board not found");
    }
    let swimlaneID = board.swimlanes.id(status);
    // board.swimlanes.push({ title });

    swimlaneID.tasks.push({ title, description, creationDate: Date.now(), priority, dueDate });
    user.totalTasks = Number(user.totalTasks) || 0;
    user.totalTasks += 1;

    user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// Edit a task
module.exports.postEditTask = async (req, res, next) => {
  const { taskId, swimlaneId, boardId, title, description, priority, dueDate, timebox, timeboxDuration } = req.body;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    let swimlane = board.swimlanes.id(swimlaneId);
    let task = swimlane.tasks.id(taskId);

    task.title = title;
    task.description = description;
    task.priority = priority;
    task.dueDate = dueDate;

    if (timebox === "on") {
      task.timebox = true;
      task.timeboxDuration = timeboxDuration;
    } else {
      task.timebox = false;
      task.timeboxDuration = 0;
    }

    user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// moving tasks around on the board
module.exports.getMoveTask = async (req, res, next) => {
  try {
    const { boardId, orgSwimlaneId, swimlaneId, taskId, newPosition } = req.query;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error("User not found");
    }

    // Find the board
    const board = user.boards.id(boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    // Find the original swimlane
    const originalSwimlane = board.swimlanes.id(orgSwimlaneId);
    if (!originalSwimlane) {
      throw new Error("Original swimlane not found");
    }

    // Find the new swimlane
    const newSwimlane = board.swimlanes.id(swimlaneId);
    if (!newSwimlane) {
      throw new Error("New swimlane not found");
    }

    // Find the task in the original swimlane
    const task = originalSwimlane.tasks.id(taskId);
    if (!task) {
      throw new Error("Task not found in original swimlane");
    }

    // Remove the task from the original swimlane
    originalSwimlane.tasks.pull(taskId);

    // Add the task to the new swimlane at the specified position
    newSwimlane.tasks.splice(newPosition, 0, task);

    await user.save();

    return { success: true, message: "Task moved successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

// deleting a board
module.exports.getDeleteBoard = async (req, res, next) => {
  const { boardId } = req.query;
  try {
    let user = await User.findById(req.user._id);
    //counting all tasks in the board
    let noOfTasks = 0;
    user.boards.forEach((board) => {
      if (board._id == boardId) {
        board.swimlanes.forEach((swimlane) => {
          noOfTasks += swimlane.tasks.length;
        });
      }
    });
    //updating the deleted tasks count
    user.totalTasks = Number(user.totalTasks) || 0;
    user.totalTasks -= noOfTasks;

    // deleting the board
    user.boards.pull({ _id: boardId });
    await user.save();
    res.redirect("/app");
  } catch (err) {
    res.render("error", { err });
  }
};

// deleting a column
module.exports.getDeleteColumn = async (req, res, next) => {
  const { swimlaneId, boardId } = req.query;
  try {
    let user = await User.findById(req.user._id);

    let board = user.boards.id(boardId);

    //marking all tasks in this swimlane as deleted
    let noOfTasks = board.swimlanes.id(swimlaneId).tasks.length;
    user.totalTasks = Number(user.totalTasks) || 0;
    user.totalTasks -= noOfTasks;

    // deleting the swimlane
    board.swimlanes.pull({ _id: swimlaneId });

    await user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// deleting a task
module.exports.getDeleteTask = async (req, res, next) => {
  const { taskId, swimlaneId, boardId } = req.query;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    let swimlane = board.swimlanes.id(swimlaneId);
    swimlane.tasks.pull({ _id: taskId });

    user.totalTasks = Number(user.totalTasks) || 0;
    user.totalTasks -= 1;

    await user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// completing a task
module.exports.getCompleteTask = async (req, res, next) => {
  const { taskId, swimlaneId, boardId } = req.query;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    let swimlane = board.swimlanes.id(swimlaneId);
    swimlane.tasks.pull({ _id: taskId });
    user.deletedTasks = Number(user.deletedTasks) || 0;
    user.deletedTasks += 1;

    await user.save();
    res.redirect("/app/board?boardId=" + boardId);
  } catch (err) {
    res.render("error", { err });
  }
};

// create calendar event
module.exports.postBookTime = async (req, res, next) => {
  const { taskId, swimlaneId, boardId, title, description, priority, dueDate, timebox, timeboxDuration } = req.body;
  try {
    let user = await User.findById(req.user._id);
    let board = user.boards.id(boardId);
    let swimlane = board.swimlanes.id(swimlaneId);
    let task = swimlane.tasks.id(taskId);

    task.title = title;
    task.description = description;
    task.priority = priority;
    task.dueDate = dueDate;

    if (timebox === "on") {
      task.timebox = true;
      task.timeboxDuration = timeboxDuration;
    } else {
      task.timebox = false;
      task.timeboxDuration = 0;
    }

    task.timeboxDuration = timeboxDuration;

    // console log the task to debug
    console.log(task);

    // if user makes any changes and clicks on book time instead of save, then the task will be updated
    user.save();

    // Google Calendar API authentication
    const clientId = process.env.Google_Cal_ClientID;
    const clientSecret = process.env.Google_Cal_Secret;
    const redirectUrl = 'http://localhost:4444/oauth2callback';

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUrl
    );
    
    // Access scopes for creating Calendar event
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events'
    ];

    // Generate a url that asks permissions for the Drive activity scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      // Pass in the scopes array defined above.
      scope: scopes
    });

    // Redirect to the OAuth2 consent form
    res.redirect(authorizationUrl);

    // Handle the OAuth 2.0 server response
    const url = require('url');

    app.get('/oauth2callback', async (req, res) => {
      let q = url.parse(req.url, true).query;

      if (q.error) {
        console.log('Error:' + q.error);
      } else { // Get access tokens
        let { tokens } = await oauth2Client.getToken(q.code);
        oauth2Client.setCredentials(tokens);
      }
    });

    // Create a new calendar event
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      'summary': 'Test Task Focus',
      'description': 'booked via WillDo app',
      'start': {
        'dateTime': '2024-05-20T09:00:00-04:00',
        'timeZone': 'America/New_York',
      },
      'end': {
        'dateTime': '2024-05-20T10:00:00-04:00',
        'timeZone': 'America/New_York',
      }
    };

    calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    }, (err, res) => {
      if (err) return console.log('The Calendar API returned an error: ' + err);
      console.log('Event created: %s', res.data.htmlLink);
    });

    res.redirect("/app/board?boardId=" + boardId);

  } catch (err) {
    res.render("error", { err });
  }
};
