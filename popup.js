const canadaRegionSelect = document.getElementById("canadaRegion");
const usRegionSelect = document.getElementById("usRegion");
const customRateInput = document.getElementById("customRate");

const canadaRegions = {
  AB: "Alberta (5%)",
  BC: "British Columbia (12%)",
  MB: "Manitoba (12%)",
  NB: "New Brunswick (15%)",
  NL: "Newfoundland and Labrador (15%)",
  NT: "Northwest Territories (5%)",
  NS: "Nova Scotia (14%)",
  NU: "Nunavut (5%)", 
  ON: "Ontario (13%)",
  PE: "Prince Edward Island (15%)",
  QC: "Quebec (14.975%)",
  SK: "Saskatchewan (11%)",
  YT: "Yukon (5%)"
};

const usRegions = {
  AL: "Alabama (4%)",
  AK: "Alaska (0%)",
  AZ: "Arizona (5.6%)",
  AR: "Arkansas (6.5%)",
  CA: "California (7.25%)",
  CO: "Colorado (2.9%)",
  CT: "Connecticut (6.35%)",
  DE: "Delaware (0%)",
  FL: "Florida (6%)",
  GA: "Georgia (4%)",
  HI: "Hawaii (4%)",
  ID: "Idaho (6%)",
  IL: "Illinois (6.25%)",
  IN: "Indiana (7%)",
  IA: "Iowa (6%)",
  KS: "Kansas (6.5%)",
  KY: "Kentucky (6%)",
  LA: "Louisiana (4.45%)",
  ME: "Maine (5.5%)",
  MD: "Maryland (6%)",
  MA: "Massachusetts (6.25%)",
  MI: "Michigan (6%)",
  MN: "Minnesota (6.875%)",
  MS: "Mississippi (7%)",
  MO: "Missouri (4.225%)",
  MT: "Montana (0%)",
  NE: "Nebraska (5.5%)",
  NV: "Nevada (6.85%)",
  NH: "New Hampshire (0%)",
  NJ: "New Jersey (6.625%)",
  NM: "New Mexico (5.125%)",
  NY: "New York (4%)",
  NC: "North Carolina (4.75%)",
  ND: "North Dakota (5%)",
  OH: "Ohio (5.75%)",
  OK: "Oklahoma (4.5%)",
  OR: "Oregon (0%)",
  PA: "Pennsylvania (6%)",
  RI: "Rhode Island (7%)",
  SC: "South Carolina (6%)",
  SD: "South Dakota (4.2%)",
  TN: "Tennessee (7%)",
  TX: "Texas (6.25%)",
  UT: "Utah (4.85%)",
  VT: "Vermont (6%)",
  VA: "Virginia (5.3%)",
  WA: "Washington (6.5%)",
  WV: "West Virginia (6%)",
  WI: "Wisconsin (5%)",
  WY: "Wyoming (4%)"
};

// Populate select options helper
function populateSelect(selectElement, options) {
  selectElement.innerHTML = "";
  for (const code in options) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = options[code];
    selectElement.appendChild(option);
  }
}

const modeRadios = document.querySelectorAll('input[name="mode"]');
const canadaSection = document.getElementById("canadaSection");
const usSection = document.getElementById("usSection");
const customSection = document.getElementById("customSection");

// Show/hide sections based on selected mode
function updateSections() {
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  canadaSection.classList.toggle('active', selectedMode === "Canada");
  usSection.classList.toggle('active', selectedMode === "US");
  customSection.classList.toggle('active', selectedMode === "Custom");
}


// Save settings to chrome.storage
function saveSettings() {
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  const data = { mode: selectedMode };

  if (selectedMode === "Canada") {
    data.country = "Canada";
    data.region = canadaRegionSelect.value;
    data.customRate = "";
  } else if (selectedMode === "US") {
    data.country = "US";
    data.region = usRegionSelect.value;
    data.customRate = "";
  } else if (selectedMode === "Custom") {
    data.country = "Custom";
    data.region = "";
    data.customRate = customRateInput.value.trim();
  }

  chrome.storage.sync.set(data, () => {
    window.close(); 
  });
}

// Load settings from chrome.storage
function loadSettings() {
  chrome.storage.sync.get(["mode", "country", "region", "customRate"], (data) => {
    // If no mode saved, set defaults and save
    if (!data.mode) {
      // Defaults
      const defaultData = {
        mode: "Canada",
        country: "Canada",
        region: "ON",
        customRate: ""
      };
      chrome.storage.sync.set(defaultData, () => {
        console.log("Default settings saved:", defaultData);
        applySettings(defaultData);
      });
    } else {
      applySettings(data);
    }
  });
}

// Apply loaded or default settings to UI
function applySettings(data) {
  const mode = data.mode;

  // Set mode radio
  const modeRadio = Array.from(modeRadios).find(r => r.value === mode);
  if (modeRadio) modeRadio.checked = true;

  updateSections();

  if (mode === "Canada") {
    populateSelect(canadaRegionSelect, canadaRegions);
    if (data.region && canadaRegions[data.region]) {
      canadaRegionSelect.value = data.region;
    } else {
      canadaRegionSelect.value = "AB"; // fallback default
    }
  } else if (mode === "US") {
    populateSelect(usRegionSelect, usRegions);
    if (data.region && usRegions[data.region]) {
      usRegionSelect.value = data.region;
    } else {
      usRegionSelect.value = "AL"; // fallback default
    }
  }

  if (mode === "Custom") {
    customRateInput.value = data.customRate || "";
  }
}

modeRadios.forEach(radio => {
  radio.addEventListener("change", updateSections);
});


// canadaRegionSelect.addEventListener("change", saveSettings);
// usRegionSelect.addEventListener("change", saveSettings);
// customRateInput.addEventListener("input", saveSettings);
document.getElementById("saveBtn").addEventListener("click", saveSettings);
// Initialize UI
populateSelect(canadaRegionSelect, canadaRegions);
populateSelect(usRegionSelect, usRegions);
loadSettings();
