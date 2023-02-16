# Welcome to your new Data UI app!

## Tech Stack

Data UI apps include the following rock-solid technical decisions out of the box:

- ReactJS
- Redux
- Redux Toolkit
- TypeScript
- Local Storage (integrated with MST for restoring state)
- Session Storage
- axios (to talk to REST servers)
- And more!

## Quick Start

The Data UI project's structure will look similar to this:

```
📦frontend-ui  
 ┣ 📂public
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜index.html
 ┃ ┣ 📜logo192.png
 ┃ ┣ 📜logo512.png
 ┃ ┣ 📜manifest.json
 ┃ ┗ 📜robots.txt
 ┣ 📂src
 ┃ ┣ 📂assets
 ┃ ┃ ┣ 📂css 
 ┃ ┃ ┣ 📂font 
 ┃ ┃ ┣ 📂icomoon 
 ┃ ┃ ┗ 📂images 
 ┃ ┣ 📂components 
 ┃ ┣ 📂constants
 ┃ ┣ 📂helpers
 ┃ ┣ 📂hooks
 ┃ ┣ 📂layouts
 ┃ ┣ 📂pages
 ┃ ┣ 📂routes 
 ┃ ┣ 📂schema 
 ┃ ┣ 📂service 
 ┃ ┣ 📂store 
 ┃ ┣ 📂styles 
 ┃ ┣ 📜App.css
 ┃ ┣ 📜App.tsx
 ┃ ┣ 📜config.js
 ┃ ┣ 📜hooks.ts
 ┃ ┣ 📜index.js
 ┃ ┣ 📜react-app-env.d.ts
 ┃ ┣ 📜reportWebVitals.js
 ┃ ┣ 📜setupTests.js
 ┃ ┗ 📜test.utils.tsx
 ┣ 📜.env
 ┣ 📜.env.test
 ┣ 📜.gitignore
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜tsconfig.json

```

### ./app directory

Included in an Data UI project is the `app` directory. This is a directory you would normally have to create when using vanilla ReactJS.

The inside of the src directory looks similar to the following:

```
 📂src
 ┣ 📂assets
 ┣ 📂components 
 ┣ 📂constants
 ┣ 📂helpers
 ┣ 📂hooks
 ┣ 📂layouts
 ┣ 📂pages
 ┣ 📂routes 
 ┣ 📂schema 
 ┣ 📂service 
 ┣ 📂store 
 ┣ 📂styles 
 ┣ 📜App.css
 ┣ 📜App.tsx
 ┣ 📜config.js
 ┣ 📜hooks.ts
 ┣ 📜index.js
 ┣ 📜react-app-env.d.ts
 ┣ 📜reportWebVitals.js
 ┣ 📜setupTests.js
 ┗ 📜test.utils.tsx
```

**assets**
This is folder containing static files, such as Images, SVG, fonts, and global CSS.

**components**
This is where your React components will live. Each component will have a directory containing the `.tsx` file, along with a story file, the App will come with a number of globally shared/reusable components such as layouts (shells) wrap, nav), form element, button.

**constants**
This is where the constants or strings you define are stored.

**helpers**
This is a great place to put miscellaneous helpers and utilities. Things like date helpers, formatters, etc. are often found here. However, it should only be used for things that are truely shared across your application. If a helper or utility is only used by a specific component or model, consider co-locating your helper with that component or model.

**hooks**
The hooks folder contains every single custom hook in your entire project.

**layouts**
This is a special folder for placing any layout based components. This would be things like a sidebar, navbar, container, etc.

**pages**
This folder only contains one file per page, files in the pages folder are actually quite simple since they just glue together a few feature components and some general components.

**routes**
We will use React Router to navigate between components. React Router is a standard library for routing in React. It enables the navigation among views of various components in a React Application, allows changing the browser URL, and keeps the UI in sync with the URL.

**schema**
All forms in this folder will be loaded to an Graph Database and UI is rendered by formId and form model will be validated on the browser as well as backend APIs.

**service**
Any services that interface with the outside world will live here (think REST APIs, Push Notifications, etc.).

**store**
A store holds the whole state tree of your application.

**styles**
Here lives the theme for your application, including spacing, colors, and typography.

**App.css**
Here lives the theme including spacing, colors, and typography for `App.tsx` file

**App.tsx**
This is the entry point to your app. This is where you will find the main App component which renders the rest of the application.

**config.js**
here is the configuration file for your application

**hooks.ts**
This file imports all directory hooks

**index.js**
This is the entry point to your app.

**test.utils.tsx**
This directory will hold your configs and mocks, as well as your test file.