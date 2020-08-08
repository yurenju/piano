// layout for a set of keys, first is position, second is black (true) or white (false)
const layout = [
  [0, false],
  [0, true],
  [1, false],
  [1, true],
  [2, false],
  [3, false],
  [3, true],
  [4, false],
  [4, true],
  [5, false],
  [5, true],
  [6, false],
];

function onMessage(event) {
  const [channel, number, value] = event.data;
  const el = document.querySelector(`[data-number="${number}"]`);
  console.log("channel", channel, "number", number, "value", value);

  // reference https://github.com/mikaeljorhult/midi-events/blob/master/src/main.js
  if (channel < 144) {
    // note off
    el.classList.remove("pressed");
  } else if (channel < 160) {
    // note on
    el.classList.add("pressed");
  } else if (channel < 208 && channel > 191) {
    // control change
    if (number === 64) {
      const pressedKeys = [...document.getElementsByClassName("pressed")];
      if (value >= 64) {
        pressedKeys.forEach((key) => key.classList.add("pedaled"));
      } else {
        pressedKeys.forEach((key) => key.classList.remove("pedaled"));
      }
    }
  }
}

function renderPiano(el) {
  let whiteKeys = [];
  let blackKeys = [];

  // 21 - 108 is standard piano key range
  for (let i = 21; i < 109; i++) {
    const index = i % 12;
    const pos = layout[index];
    if (pos[1]) {
      blackKeys.push(`<div data-number="${i}"></div>`);
    } else {
      whiteKeys.push(`<div data-number="${i}"></div>`);
    }
  }
  el.innerHTML +=
    `<div class="black-keys">${blackKeys.join("")}</div>` +
    `<div class="white-keys">${whiteKeys.join("")}</div>`;
}

// list event from midi inputs, index -1 is listening all inputs
function listenEvent(inputs, index = -1) {
  // index = -1 means listen all midi inputs
  inputs.forEach((input, i) => {
    if (i === index || index < 0) {
      input.onmidimessage = onMessage;
    } else {
      input.onmidimessage = null;
    }
  });
}

function renderSettings(el, inputs) {
  const id = "input-select";
  const options = [];
  options.push('<option value="-1">Listen all MIDI inputs</option>');
  inputs.forEach((input, index) => {
    options.push(
      `<option value="${index}">${input.id} - ${input.manufacturer}</option>`
    );
  });
  el.innerHTML = `<select id="${id}">${options.join("")}</select>`;

  const select = document.getElementById(id);
  select.addEventListener("change", (event) => {
    const index = Number.parseInt(event.target.value);
    listenEvent(inputs, index);
  });
}

async function main() {
  const piano = document.getElementById("piano");
  const settings = document.getElementById("settings");

  try {
    const access = await navigator.requestMIDIAccess();
    const inputs = [...access.inputs.values()];
    listenEvent(inputs);
    renderPiano(piano);
    renderSettings(settings, inputs);
  } catch (e) {
    alert(e);
  }
}

main();
