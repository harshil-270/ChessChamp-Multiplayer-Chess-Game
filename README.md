# Multiplayer-Chess-Game
Online multiplayer chess game. You can play against your friend or against the computer.

### TO-DO
- [ ] Add/Edit Profile Picture
- [ ] Improve UI/UX
- [ ] Improve evalution strategy for Minimax algo
- [ ] Add various game statistics in profile page


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Chat App</h3>

  <p align="center">
    <br />
    <a href="https://github.com/harshil-270/ChessChamp-Multiplayer-Chess-Game/issues">Report Bug</a>
    ·
    <a href="https://github.com/harshil-270/ChessChamp-Multiplayer-Chess-Game/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href='#features'>Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![Product Name Screen Shot][product-screenshot]

### Features
-There are 2 modes in this game.<br />
&nbsp;&nbsp;&nbsp;1. Play with friend(Need to register first)<br />
&nbsp;&nbsp;&nbsp;2. Play against computer(Used Minimax algorithm to generate move. Improved using alpha beta pruning)<br />
-Rating graph, View matches history.<br/>
-Basic functionality like register/login, forget password

### Built With

* [NodeJS](https://nodejs.org/en/)
* [ExpressJS](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/1)
* [ReactJS](https://reactjs.org/)
* [Socket.io](https://socket.io/)
* [Chess.js](https://github.com/jhlywa/chess.js)

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Installation


Fork, then download or clone the repo.
```bash
git clone https://github.com/harshil-270/ChatApp.git
```

For the **back-end**, go to home folder and install the dependencies once via the terminal.
```bash
npm install
```

If you want to configure the **front-end**, go to *frontend* folder via the terminal.

```bash
cd client
```

Install the dependencies required by React once.
```bash
npm install
```

Now create *.env* file and fill all the details.
```env
MONGO_URI = PUT_YOUR_MONGODB_CONNECTION_STRING_HERE
JWT_SECRET = PUT_JWT_SECRET_HERE
MESSAGE_KEY = MESSGAE_ENCRYPTION_KEY
GMAIL_USER = YOUR_GMAIL_ADDRESS
GMAIL_PASS = YOUR_GMAIL_PASS
```

Now you are ready to run the server and frontend.

<br />

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


<!-- CONTACT -->
## Contact

Harshil Tagadiya - [@Harshil Tagadiya](https://www.linkedin.com/in/harshil-tagadiya-442518190/) - harshiltagadiya@gmail.com

Project Link: [https://github.com/harshil-270/ChatApp](https://github.com/harshil-270/ChatApp)




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[product-screenshot]: images/Screenshot1.PNG
