const searchResults = document.querySelector(".results");
const searchBox = document.querySelector(".search-box");
const autoResults = document.querySelector(".autocomplete");
const autoResultsContainer = document.querySelector(".autocomplete__list");

let textInput;
let arrOptions = [];

const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timer);
    timer = setTimeout(fnCall, debounceTime);
  };
};

function newOptionsElement(elem) {
  const option = document.createElement("option");
  option.dataset.name = elem.name;
  option.dataset.owner = elem.owner;
  option.dataset.stars = elem.stars;
  option.textContent = elem.name;
  return option;
}

function newOptions(arr) {
  if (autoResultsContainer.children.length === 0) {
    for (let i = 0; i < 5; i++) {
      autoResultsContainer.appendChild(newOptionsElement(arr[i]));
    }
  } else {
    for (let i = 0; i < 5; i++) {
      autoResultsContainer.replaceChild(newOptionsElement(arr[i]), autoResultsContainer.childNodes[i]);
    }
  }
}

function getRequest(res) {
  fetch(`https://api.github.com/search/repositories?q=${res}`)
    .then((response) => response.json())
    .then((parsed) => {
      arrOptions = [];
      for (let elem of parsed.items) {
        let repository = {};
        repository.name = elem.name;
        repository.stars = elem.stargazers_count;
        repository.owner = elem.owner.login;
        arrOptions.push(repository);
        autoResults.style.display = "block";
      }
      newOptions(arrOptions);
    });
}

let debouncedRequest = debounce(getRequest, 400);

function newResult(el) {
  const fragment = document.createDocumentFragment();
  const repository = document.createElement("div");
  repository.classList.add("results__item");
  const nameRepository = document.createElement("p");
  nameRepository.textContent = `Name: ${el.dataset.name}`;
  const ownerRepository = document.createElement("p");
  ownerRepository.textContent = `Owner: ${el.dataset.owner}`;
  const starsRepository = document.createElement("p");
  starsRepository.textContent = `Stars: ${el.dataset.stars}`;
  const deleteButton = document.createElement('div');
  deleteButton.classList.add("results__delete-btn");
  deleteButton.onclick = function () {
    searchResults.removeChild(repository);
  };
  repository.appendChild(nameRepository);
  repository.appendChild(ownerRepository);
  repository.appendChild(starsRepository);
  repository.appendChild(deleteButton);
  fragment.appendChild(repository);
  return fragment;
}

searchBox.addEventListener("keyup", (e) => {
  textInput = e.target.value.trim();
  if (textInput.length === 0) {
    autoResults.style.display = "none";
    return;
  }
  debouncedRequest(textInput);
});

autoResults.addEventListener("click", (e) => {
  let target = e.target;
  let arrRepositories = Array.from(searchResults.children);
  arrRepositories.push(newResult(target));
  
  arrRepositories.forEach((elem) => {    
      searchResults.appendChild(elem);    
  });
  searchBox.value = "";
  autoResults.style.display = "none";
});