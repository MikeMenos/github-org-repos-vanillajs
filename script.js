const search = document.getElementById("search");
const output = document.getElementById("output");
const repos = `https://api.github.com/search/repositories?q=`;
const clear = document.getElementById("clear");
const form = document.getElementById("form");
const text = document.getElementById("repositories");
const content = document.getElementById("content");
const tableBody = document.querySelector("tbody");
const tbl = document.querySelector("table");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
let favorites = localStorage.getItem("favoriteRepos");

if (!favorites) {
  localStorage.setItem("favoriteRepos", JSON.stringify([]));
}

let page = 1;
let canSubmit = true;

prev.style.display = "none";
next.style.display = "none";

//FORM SUBMISSION
form.addEventListener("submit", (e) => {
  tableBody.innerHTML = "";

  if (canSubmit) {
    submitForm(e, organization);
  } else {
    e.preventDefault();
  }
});

function submitForm(e, organization) {
  e.preventDefault();
  canSubmit = false;
  fetch(constructUrl(organization))
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      canSubmit = true;
      prev.style.display = "block";
      next.style.display = "block";
      const results = data.items;
      console.log(results);

      results.forEach(createTableRowForRepo);
    })

    .catch((error) => {
      canSubmit = true;
      console.log("There was an error", error);
      prev.style.display = "none";
      next.style.display = "none";
    });
}

//NEXT
next.addEventListener("click", (e) => {
  page++;
  tableBody.innerHTML = "";
  fetch(constructUrl(organization))
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      canSubmit = true;
      const count = data.total_count;
      // console.log(count);
      if (page == count) {
        prev.disabled = true;
      }
    });
  submitForm(e, organization);
  // console.log(page);
});

//PREVIOUS
prev.addEventListener("click", (e) => {
  page--;
  tableBody.innerHTML = "";
  if (page == 0) {
    prev.disabled = true;
  }
  form.addEventListener("submit", (e) => {
    if (canSubmit) {
      submitForm(e, organization);
    } else {
      e.preventDefault();
    }
  });
  submitForm(e, organization);
});

//URL CONSTRUCTION
const constructUrl = (organization) =>
  `${repos}${organization}&sort=stars&order=desc&page=${page}&per_page=5`;

text.addEventListener("keyup", (e) => {
  const value = text.value;
  organization = value;
});

// TOGGLE FAVOURITES ON CLICK
const starClickEventListener = (starIcon, repoId) => {
  let favorites = [];

  if (starIcon.classList.contains("far")) {
    starIcon.classList.remove("far");
    starIcon.classList.add("fas");
    favorites = addRepositoryToFavorites(getFavorites(), repoId);
    console.log(favorites);
  } else {
    starIcon.classList.remove("fas");
    starIcon.classList.add("far");
    favorites = removeRepositoriesFromFavorites(getFavorites(), repoId);
  }
  setArrayToLocalStorage(favorites);
};

// CREATE TABLE
const createTableRowForRepo = (repo) => {
  const tr = document.createElement("tr");

  const cell1 = document.createElement("td");
  const cell2 = document.createElement("td");
  const cell3 = document.createElement("td");
  const cell4 = document.createElement("td");

  let outcome = "";
  let outcome2 = "";
  let outcome3 = "";
  let outcome4 = "";
  const repoId = repo.id;

  outcome = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;

  outcome2 = `${repo.stargazers_count}`;

  outcome3 = `${repo.updated_at}`;

  outcome4 = isInFavorites(getFavorites(), repoId)
    ? `<i class="fas fa-star"></i>`
    : `<i class="far fa-star"></i>`;

  cell1.innerHTML = outcome;
  cell2.innerHTML = outcome2;
  cell3.innerHTML = outcome3;
  cell4.innerHTML = outcome4;

  tr.appendChild(cell1);
  tr.appendChild(cell2);
  tr.appendChild(cell3);
  tr.appendChild(cell4);
  tableBody.appendChild(tr);
  tbl.appendChild(tableBody);

  const starElement = tr.querySelector(".fa-star");

  starElement.setAttribute("repo-id", repoId);
  starElement.addEventListener("click", () => {
    starClickEventListener(starElement, repoId);
  });
};

const setArrayToLocalStorage = (favorites) => {
  localStorage.setItem("favoriteRepos", JSON.stringify(favorites));
};

const addRepositoryToFavorites = (favorites, repoId) => {
  return [...favorites, repoId];
};

const removeRepositoriesFromFavorites = (favorites, repoId) => {
  return favorites.filter((favoriteRepo) => favoriteRepo !== repoId);
};

const isInFavorites = (favorites, repoId) => {
  return favorites.some((favoriteRepo) => favoriteRepo === repoId);
};

const getFavorites = () => {
  return JSON.parse(localStorage.getItem("favoriteRepos"));
};
