# WillDo (a KanDo fork)
A personal task management Kanban Board app, with Timeboxing feature to book Google Calendar focus time events.

## Inspiration
We all have used some productivity app - from simple to-do lists to complex project management apps. While these apps help us add items to a board, manage status, priorities, categories, etc. But none of them actually help us allocate time to each task to get it done.

## What it does
WillDo helps with timeboxing; allocating time slots on the calendar for each open task on the board. After creating items on their board, a user can create calendar events from the app to allocate focus time for each.

## How we built it
The project uses a Node.js backend with Express server and MongoDB database. For frontend, we used handlebars.js instead of React. The key feature uses Google OAuth 2.0 and Calendar API's create event endpoint.

## Challenges we ran into
The create event endpoint scope is seen as 'sensitive' by Google. They have extra security and a manual verification process for that which takes time. This added to the already crunched 24h timeline.

## Accomplishments that we're proud of
Modifying the source repo's schema and UI to support our Timeboxing feature.

## What we learned
Working with APIs that need user consent for the scope and generating OAuth access tokens. This was quite different from using much simple API keys authentication.

## What's next for WillDo
Once Google client is verified, we'll finish the project with the complete Timeboxing functionality.
