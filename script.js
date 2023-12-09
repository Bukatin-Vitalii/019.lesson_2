const usernameInput = document.getElementById('usernameInput');
const searchButton = document.querySelector('button');
const randomUserButton = document.getElementById('randomUserButton');
const errorMessage = document.getElementById('inputErrorMessage');
const userInfoContainer = document.querySelector('.user');

searchButton.addEventListener('click', searchUser);
randomUserButton.addEventListener('click', getRandomUser);
usernameInput.addEventListener('input', validateUsername);

async function fetchUserData(username) {
	const response = await fetch(`https://api.github.com/users/${username}`);
	return response.json();
}

async function fetchUserRepositories(username) {
	const response = await fetch(`https://api.github.com/users/${username}/repos`);
	return response.json();
}

function validateUsername() {
	const username = usernameInput.value.trim();
	const usernameRegex = /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;

	errorMessage.textContent = username === '' ? 'Enter a GitHub username' :
		!usernameRegex.test(username) ? 'Invalid username format' : '';
	searchButton.disabled = !username || !usernameRegex.test(username);
}

async function searchUser() {
	const username = usernameInput.value.trim();
	if (!username) {
		errorMessage.textContent = 'Enter a GitHub username';
		return;
	}

	try {
		const userData = await fetchUserData(username);
		const userRepositoriesData = await fetchUserRepositories(username);

		if (userData.login && userRepositoriesData) {
			userInfoContainer.innerHTML = '';
			userData.repositories = userRepositoriesData;
			prepareUserInfo(userData);
			showUserInfo();
		} else {
			userInfoContainer.innerHTML = `<p>User not found. Please try again.</p>`;
		}
	} catch (error) {
		console.error(error);
	}
}

async function getRandomUser() {
	try {
		const response = await fetch('https://api.github.com/users');
		const users = await response.json();
		const randomUser = users[Math.floor(Math.random() * users.length)];

		errorMessage.textContent = '';
		usernameInput.value = '';
		userInfoContainer.innerHTML = '';

		if (randomUser) {
			const userRepositoriesData = await fetchUserRepositories(randomUser.login);
			randomUser.repositories = userRepositoriesData;
			prepareUserInfo(randomUser);
			showUserInfo();
		}
	} catch (error) {
		console.error(error);
	}
}

function showUserInfo() {
	userInfoContainer.classList.add('active');
}

function prepareUserInfo(user) {
	userInfoContainer.innerHTML = `
		<div class="user__top">
			<div class="user__left">
				<div class="user__info">
					<h2 class="user__title">Username:</h2>
					<p class="user__value">${user.login}</p>
				</div>
				<div class="user__info">
					<h2 class="user__title">Bio:</h2>
					<p class="user__value">${user.bio || 'N / A'}</p>
				</div>
				<div class="user__info">
					<h2 class="user__title">Location:</h2>
					<p class="user__value">${user.location || 'N / A'}</p>
				</div>
				<div class="user__info">
					<h2 class="user__title">Followers:</h2>
					<p class="user__value">${user.followers || 0}</p>
				</div>
			</div>
			<div class="user__right">
				<img class="user__img" src="${user.avatar_url}" alt="User Avatar">
			</div>
		</div>
	`;

	if (user.repositories.length > 0) {
		showUserRepositories(user.repositories)
	}
}

function showUserRepositories(repositories) {
	const repositoriesHTML = repositories.map(repo => `
			<li class="user__repositories-item">
					<a href="${repo.html_url}" target="_blank" class="user__repositories-link">${repo.name}</a>
			</li>
	`).join('');

	userInfoContainer.innerHTML += `
			<div class="user__repositories">
					<h2 class="user__repositories-title">Repositories:</h2>
					<ul class="user__repositories-list">
							${repositoriesHTML}
					</ul>
			</div>
	`;
}