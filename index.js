const METHOD = 'POST';
const API_URL = 'https://us-central1-mercdev-academy.cloudfunctions.net/login';
const HEADERS = new Headers({ 'Content-Type': 'application/json' });

function login(data = {}) {
  return fetch(API_URL, {
    method: METHOD,
    headers: HEADERS,
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function getProfile() {
  if (!document.cookie.length) return null;

  try {
    return JSON.parse(document.cookie.replace('profile=', '').replace(';', '')); 
  } catch(error) {
    return null;
  }
}

function setProfile(name, profile) {
  if (name && profile) document.cookie = `${name}=${profile}`;
}

function removeProfile() {
  document.cookie = 'profile=null';
}

const DEFAULT_INPUT_VALUE = '';
let hasLoginError = false;
let emailValue = DEFAULT_INPUT_VALUE;
let passwordValue = DEFAULT_INPUT_VALUE;

function renderProfilePage(profile) {
  if (!profile) return;
  
  const profilePage = document.createElement('div');
  profilePage.classList.add('column');

  const logo = document.createElement('div');
  logo.classList.add('logo');
  profilePage.appendChild(logo);

  const form = document.createElement('form');

  form.classList.add('form', 'column');
  profilePage.appendChild(form);

  const photo = document.createElement('div');
  const name = document.createElement('h2');
  const btnLogOut = document.createElement('button');

  photo.classList.add('photo');
  name.classList.add('name', 'text');
  btnLogOut.classList.add('button');
  btnLogOut.setAttribute('type', 'submit');
  btnLogOut.innerHTML = 'Logout';

  form.appendChild(photo);
  form.appendChild(name);
  form.appendChild(btnLogOut);

  name.innerHTML = profile.name;
  photo.style.backgroundImage = `url(${profile.photoUrl})`;
  
  function onClickLogout(event) {
    event.preventDefault();
    event.stopPropagation();

    removeProfile();
    window.location.reload();
    btnLogOut.removeEventListener('click', onClickLogout);
  }
  
  btnLogOut.addEventListener('click', onClickLogout);
  
  document.body.appendChild(profilePage);
}

function renderLoginPage() {
  const loginPage = document.createElement('div');
  loginPage.classList.add('column');

  const logo = document.createElement('div');
  logo.classList.add('logo');
  loginPage.appendChild(logo);

  const form = document.createElement('form');
  const logIn = document.createElement('h2');
  const email = document.createElement('input');
  const password = document.createElement('input');
  const error = document.createElement('div');
  const errorText = document.createElement('span');
  const btnLogIn = document.createElement('button');

  form.classList.add('form', 'column');

  logIn.classList.add('title', 'text');
  logIn.innerHTML = "Log in";

  email.classList.add('input', 'email');
  email.setAttribute('type', 'email');
  email.setAttribute('placeholder', 'email');
  email.setAttribute('required', 'required');
  email.setAttribute('value', emailValue)

  password.classList.add('input', 'password');
  password.setAttribute('type', 'password');
  password.setAttribute('placeholder', 'password');
  password.setAttribute('required', 'required');
  email.setAttribute('value', passwordValue)

  error.classList.add('error');
  error.innerHTML = 'E-Mail or password is incorrect';

  btnLogIn.classList.add('button');
  btnLogIn.setAttribute('type', 'submit');
  btnLogIn.innerHTML = 'Login';

  loginPage.appendChild(form);

  form.appendChild(logIn);
  form.appendChild(email);
  form.appendChild(password);
  form.appendChild(error);
  form.appendChild(btnLogIn);
  
  document.body.appendChild(loginPage);

  function emailListener(event) {
    if (hasLoginError) {
      email.classList.remove('input__error');
      hasLoginError = false;
    }

    emailValue = event.target.value;
  }

  email.addEventListener('change', emailListener);

  function passwordListener(event) {
    if (hasLoginError) {
      password.classList.remove('input__error');
      hasLoginError = false;
    }

    passwordValue = event.target.value;
  }

  password.addEventListener('change', passwordListener);
  
  function onSubmit(event) { 
    event.preventDefault();
    event.stopPropagation();

    login({
        email: emailValue,
        password: passwordValue
      })
      .then(data => {
        if (data.error) {
          console.error(data.error);
          
          document.querySelector('.error').style.display = 'block';

          hasLoginError = true;
          email.classList.add('input__error');
          password.classList.add('input__error');

          return;
        }
        
        emailValue = DEFAULT_INPUT_VALUE;
        passwordValue = DEFAULT_INPUT_VALUE;

        setProfile('profile', JSON.stringify(data));

        email.removeEventListener('change', emailListener);
        password.removeEventListener('change', passwordListener);
        form.removeEventListener('submit', onSubmit);

        document.body.removeChild(loginPage)
        renderProfilePage(data);
      })
  }

  form.addEventListener('submit', onSubmit);
}

let profile = getProfile();

if (profile) {
  renderProfilePage(profile);
} else {
  renderLoginPage();
}
