import { timerNotificationSound, breakNotificationSound, notifyMe } from './notification.js';

let seconds = '00';
let minutes = '00';
const secondsUp = document.getElementById('secondsUp');
const minutesUp = document.getElementById('minutesUp');
const buttonStart = document.getElementById('button-start');
const xValueInput = document.getElementById('x-value');
const minimumTimeInput = document.querySelector('#minimum-time');
const autoStartTimerInput = document.querySelector('#auto-start-timer');
const timerNotificationInput = document.getElementById('timerNotification');
const breakNotificationInput = document.getElementById('breakNotification');
const modalForm = document.querySelector('#modalForm');
const logTimings = document.querySelector('#logTimings');
const extendBreakModalButton = document.querySelector('#extend-break-button');
let startInterval;
let breakInterval;
let xValue;
let minimumTime;
let autoStartTimer;
let breakNotification;
let breakNotificationArr;
let timerNotification;
let timerNotificationArr;
let startTime;
let breakDurationSeconds;

if (!localStorage.autoStartTimer) {
	autoStartTimerInput.checked = false;
	autoStartTimer = false;
} else {
	autoStartTimerInput.checked = localStorage.autoStartTimer === 'true';
	autoStartTimer = autoStartTimerInput.checked;
}

autoStartTimerInput.addEventListener('change', updateAutoStart);

function updateAutoStart() {
	autoStartTimer = autoStartTimerInput.checked;
	window.localStorage.setItem('autoStartTimer', autoStartTimer);
}

minimumTimeInput.value = localStorage.minimumTime;

minimumTimeInput.addEventListener('change', updateMinimumTime);

function updateMinimumTime(e) {
	minimumTime = e.target.value;
	window.localStorage.setItem('minimumTime', minimumTime);
	minimumTimeInput.value = minimumTime;
}

if (!localStorage.logTimings) {
	logTimings.innerHTML = '';
} else {
	logTimings.innerHTML = localStorage.logTimings;
}

xValueInput.value = localStorage.xValue;

if (!localStorage.timerNotification) {
	timerNotificationInput.value = '';
} else {
	timerNotificationInput.value = localStorage.timerNotification;
	timerNotificationArr = timerNotificationInput.value.split(',');
	timerNotificationArr = timerNotificationArr.map((time) => parseInt(time));
}

if (!localStorage.breakNotification) {
	breakNotificationInput.value = '';
} else {
	breakNotificationInput.value = localStorage.breakNotification;
	breakNotificationArr = breakNotificationInput.value.split(',');
	breakNotificationArr = breakNotificationArr.map((time) => parseInt(time));
}

// X-Value change
xValueInput.addEventListener('change', updateXValue);

function updateXValue(e) {
	xValue = parseFloat(e.target.value);
	window.localStorage.setItem('xValue', xValue);
	xValueInput.value = xValue;
}

//Auto Start Timer Input Change
autoStartTimerInput.addEventListener('change', updateAutoStartTimer);

function updateAutoStartTimer() {
	autoStartTimer = autoStartTimerInput.checked;
}

// Timer notification updated
timerNotificationInput.addEventListener('change', updateNotificationValueTimer);

function updateNotificationValueTimer(e) {
	timerNotification = e.target.value;
	window.localStorage.setItem('timerNotification', timerNotification);
	timerNotificationInput.value = timerNotification;
	timerNotificationArr = timerNotification.split(',');
	timerNotificationArr = timerNotificationArr.map((time) => parseInt(time));
}

// Break notification updated
breakNotificationInput.addEventListener('change', updateNotificationValueBreak);

function updateNotificationValueBreak(e) {
	breakNotification = e.target.value;
	window.localStorage.setItem('breakNotification', breakNotification);
	breakNotificationInput.value = breakNotification;
	breakNotificationArr = breakNotification.split(',');
	breakNotificationArr = breakNotificationArr.map((time) => parseInt(time));
}

// Prevent users from pressing enter to submit modal forms
modalForm.addEventListener('keydown', function (evt) {
	if (evt.keyCode === 13) {
		evt.preventDefault();
	}
});

buttonStart.onclick = function () {
	if (this.textContent === 'Start') {
		timerStartRunning();
	} else if (this.textContent === 'Break') {
		this.textContent = 'Start';
		minimumTimeInput.removeAttribute('disabled');
		clearInterval(startInterval);
		extendBreakModalButton.classList.remove('modal-invisible');
		createLogItem();
		calculateBreakDuration();
		startTime = Date.now();
		breakInterval = setInterval(breakTimer, 1000);
	}
};

function createLogItem() {
	let newItem = document.createElement('li');
	let span = document.createElement('SPAN');
	let button = document.createElement('button');
	button.textContent = '\u00D7';

	//Delete log item when close button is clicked
	button.addEventListener('click', function (evt) {
		deleteLog(this);
		evt.stopPropagation(); //prevents copying to clipboard when close button is clicked
	});
	button.setAttribute('onclick', 'deleteLog(this)'); //allow log item to be deleted after page refresh
	button.classList.add('close-button');
	span.textContent = `0:${displayMinutesOrSeconds(minutes)}:${displayMinutesOrSeconds(seconds)}`;
	span.append(button);
	span.setAttribute('onclick', 'copyToClipboard(this.textContent)');
	span.style.cursor = 'copy';
	newItem.append(span);
	logTimings.prepend(newItem);
	localStorage.logTimings = logTimings.innerHTML;
}

function calculateBreakDuration() {
	let timeWorkedSeconds = minutes * 60 + seconds;
	breakDurationSeconds = Math.ceil(timeWorkedSeconds * xValueInput.value);
	let breakMinutes = Math.floor(breakDurationSeconds / 60);
	let breakSeconds = Math.ceil(breakDurationSeconds % 60);
	// alert(`Work Time: ${minutes} minutes ${seconds} seconds \nBreak Time: ${breakMinutes} minutes ${breakSeconds} seconds `);
	seconds = breakSeconds;
	minutes = breakMinutes;
	displayTime(minutes, seconds);
	document.title = `${minutesUp.innerHTML}:${secondsUp.innerHTML} - Time for a break!`;
}

function displayMinutesOrSeconds(time) {
	return time <= 9 ? '0' + time : time;
}

function displayTime(minutes, seconds) {
	minutesUp.innerHTML = minutes <= 9 ? '0' + minutes : minutes;
	secondsUp.innerHTML = seconds <= 9 ? '0' + seconds : seconds;
}

function startTimer() {
	let millisecondsPassed = Date.now() - startTime;
	let secondsPassed = Math.floor(millisecondsPassed / 1000);
	minutes = Math.floor(secondsPassed / 60);
	seconds = secondsPassed % 60;
	displayTime(minutes, seconds);
	if (minutes >= parseInt(minimumTimeInput.value)) {
		buttonStart.removeAttribute('disabled');
		buttonStart.style.cursor = 'pointer';
	}
	if (timerNotificationArr !== undefined && timerNotificationArr.indexOf(minutes) !== -1 && seconds === 0) {
		timerNotificationSound.play();
	}
	document.title = `${minutesUp.innerHTML}:${secondsUp.innerHTML} - Time for Work!`;
}

function breakTimer() {
	let millisecondsPassed = Date.now() - startTime;
	let secondsPassed = Math.floor(millisecondsPassed / 1000);
	if (breakDurationSeconds === 0) {
		breakNotificationSound.play();
		document.title = 'PomoFlow';
		clearInterval(breakInterval);
		extendBreakModalButton.classList.add('modal-invisible');
		notifyMe();
		if (autoStartTimer) {
			timerStartRunning();
		}
	} else {
		let secondsRemaining = breakDurationSeconds - secondsPassed;
		minutes = Math.floor(secondsRemaining / 60);
		seconds = secondsRemaining % 60;
		displayTime(minutes, seconds);
		if (breakNotificationArr !== undefined && breakNotificationArr.indexOf(minutes) !== -1 && seconds === 0) {
			breakNotificationSound.play();
		}
		document.title = `${minutesUp.innerHTML}:${secondsUp.innerHTML} - Time for a break!`;
		// When timer ends
		if (secondsRemaining <= 0) {
			document.title = 'PomoFlow';
			breakNotificationSound.play();
			clearInterval(breakInterval);
			extendBreakModalButton.classList.add('modal-invisible');
			notifyMe();
			if (autoStartTimer) {
				timerStartRunning();
			}
		}
	}
}

//Nav button Hover effects

const navButtons = document.querySelectorAll('.nav-button');
for (let i = 0; i < navButtons.length; i++) {
	navButtons[i].addEventListener('mouseover', function () {
		let buttonImgs = this.children;
		for (let img of buttonImgs) {
			img.classList.toggle('img-hidden');
		}
	});

	navButtons[i].addEventListener('mouseout', function () {
		let buttonImgs = this.children;
		for (let img of buttonImgs) {
			img.classList.toggle('img-hidden');
		}
	});
}

//Timer running
function timerStartRunning() {
	startTime = Date.now();
	buttonStart.textContent = 'Break';

	//Make break button disabled to prevent users from taking a break before minimum time is up
	if (parseInt(minimumTimeInput.value) > 0) {
		//Ensure minimumTimeInput.value is set, else break button will not be disabled
		buttonStart.setAttribute('disabled', '');
		buttonStart.style.cursor = 'not-allowed';
	}

	clearInterval(breakInterval);
	extendBreakModalButton.classList.add('modal-invisible');
	seconds = 0;
	minutes = 0;

	//Disable minimumTimeInput to prevent users from changing value
	minimumTimeInput.setAttribute('disabled', '');
	startInterval = setInterval(startTimer, 1000);
}

//Extend break buttons

const extendBreakButtons = document.querySelectorAll('#extend-break-modal .extend-break');

for (let button of extendBreakButtons) {
	button.addEventListener('click', function () {
		let extraMinute = this.textContent.split(' ')[0];
		breakDurationSeconds += parseInt(extraMinute) * 60;
	});
}
