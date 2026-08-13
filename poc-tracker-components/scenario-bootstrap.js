(function (global) {
  "use strict";

  const DCC_SCENARIO_ID = "dcc-hackathon";
  const DCC_FIXTURE_URL = new URL("../scenarios/dcc-hackathon.json", global.location.href);
  let dccFixturePromise;

  function clone(value) {
    if (value === undefined) return undefined;
    if (typeof global.structuredClone === "function") return global.structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function selectedScenario() {
    return new URLSearchParams(global.location.search).get("scenario");
  }

  function loadDccFixtures() {
    if (!dccFixturePromise) {
      dccFixturePromise = global.fetch(DCC_FIXTURE_URL).then((response) => {
        if (!response.ok) throw new Error(`Fixture request failed with status ${response.status}`);
        return response.json();
      }).then((fixtures) => {
        if (fixtures?.id !== DCC_SCENARIO_ID || !fixtures.screens) {
          throw new Error("The DCC fixture pack has an invalid contract");
        }
        return fixtures;
      });
    }
    return dccFixturePromise;
  }

  function showScenarioError(root, screenId, error) {
    const panel = global.document.createElement("section");
    const eyebrow = global.document.createElement("p");
    const title = global.document.createElement("h1");
    const message = global.document.createElement("p");

    panel.className = "poc-panel poc-stack";
    panel.setAttribute("role", "alert");
    panel.dataset.scenarioError = DCC_SCENARIO_ID;
    eyebrow.className = "poc-eyebrow";
    eyebrow.textContent = "DCC Hackathon scenario";
    title.textContent = "Scenario data could not be loaded";
    message.className = "poc-muted";
    message.textContent = "Reload this preview to try again, or remove the scenario parameter to open the unchanged Base example.";
    panel.append(eyebrow, title, message);
    root.removeAttribute("aria-busy");
    root.replaceChildren(panel);
    global.document.documentElement.dataset.scenario = "error";
    global.console.error(`Unable to load ${DCC_SCENARIO_ID} data for ${screenId}`, error);
  }

  function preserveFixtureReset(root, instance, fixtureData) {
    if (!instance || typeof instance.setData !== "function") return;
    root.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function" || !target.closest("[data-reset]")) return;
      Promise.resolve().then(() => instance.setData(clone(fixtureData)));
    });
  }

  function mount(screenId, componentModule, root) {
    if (!root || !componentModule || typeof componentModule.mount !== "function") {
      if (root) showScenarioError(root, screenId, new Error("The screen module is unavailable"));
      return undefined;
    }

    if (selectedScenario() !== DCC_SCENARIO_ID) {
      return componentModule.mount(root);
    }

    root.setAttribute("aria-busy", "true");
    return loadDccFixtures().then((fixtures) => {
      const fixture = fixtures.screens[screenId];
      if (!fixture || fixture.data === undefined) {
        throw new Error(`No DCC fixture is registered for ${screenId}`);
      }

      const fixtureData = clone(fixture.data);
      const fixtureOptions = clone(fixture.options);
      const instance = componentModule.mount(root, fixtureData, fixtureOptions);
      root.removeAttribute("aria-busy");
      global.document.documentElement.dataset.scenario = DCC_SCENARIO_ID;
      if (fixture.documentTitle) global.document.title = fixture.documentTitle;
      if (screenId === "earned-value") preserveFixtureReset(root, instance, fixture.data);
      return instance;
    }).catch((error) => {
      showScenarioError(root, screenId, error);
      return undefined;
    });
  }

  global.PoCTrackerScenario = { mount };
})(window);
