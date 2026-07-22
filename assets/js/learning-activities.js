document.addEventListener("DOMContentLoaded", function () {
	var questionCards = document.querySelectorAll(
		"[data-knowledge-question]"
	);

	questionCards.forEach(function (card) {
		var options = card.querySelectorAll(".knowledge-option");
		var feedback = card.querySelector(".knowledge-feedback");
		var correctFeedback = card.querySelector(".feedback-correct");
		var incorrectFeedback = card.querySelector(".feedback-incorrect");
		var resetButton = card.querySelector(".knowledge-reset");

		options.forEach(function (option) {
			option.addEventListener("click", function () {
				var isCorrect =
					option.getAttribute("data-correct") === "true";

				options.forEach(function (otherOption) {
					otherOption.disabled = true;
					otherOption.setAttribute("aria-pressed", "false");
					otherOption.classList.remove(
						"is-correct",
						"is-incorrect",
						"shows-correct-answer"
					);
				});

				option.setAttribute("aria-pressed", "true");

				if (isCorrect) {
					option.classList.add("is-correct");

					correctFeedback.hidden = false;
					incorrectFeedback.hidden = true;

					feedback.classList.remove("is-incorrect");
					feedback.classList.add("is-correct");
				} else {
					option.classList.add("is-incorrect");

					var correctOption = card.querySelector(
						'.knowledge-option[data-correct="true"]'
					);

					if (correctOption) {
						correctOption.classList.add(
							"shows-correct-answer"
						);
					}

					correctFeedback.hidden = true;
					incorrectFeedback.hidden = false;

					feedback.classList.remove("is-correct");
					feedback.classList.add("is-incorrect");
				}

				feedback.hidden = false;
			});
		});

		resetButton.addEventListener("click", function () {
			options.forEach(function (option) {
				option.disabled = false;
				option.setAttribute("aria-pressed", "false");
				option.classList.remove(
					"is-correct",
					"is-incorrect",
					"shows-correct-answer"
				);
			});

			correctFeedback.hidden = true;
			incorrectFeedback.hidden = true;

			feedback.hidden = true;
			feedback.classList.remove(
				"is-correct",
				"is-incorrect"
			);

			if (options.length > 0) {
				options[0].focus();
			}
		});
	});
});


/* ---------------------------------------------------------
   Evidence sorting activity
   Reusable on any page using data-component="evidence-sort"
   --------------------------------------------------------- */

(function () {
	"use strict";

	function initialiseEvidenceSorts(root) {
		var activities = root.querySelectorAll(
			'[data-component="evidence-sort"]'
		);

		activities.forEach(function (activity) {
			if (activity.dataset.initialised === "true") {
				return;
			}

			activity.dataset.initialised = "true";

			var bank = activity.querySelector("[data-evidence-bank]");
			var items = Array.from(
				activity.querySelectorAll("[data-evidence-item]")
			);
			var piles = Array.from(
				activity.querySelectorAll("[data-evidence-pile]")
			);
			var progress = activity.querySelector(
				"[data-evidence-progress]"
			);
			var completedMessage = activity.querySelector(
				"[data-evidence-complete]"
			);
			var resetButton = activity.querySelector(
				"[data-evidence-reset]"
			);

			items.forEach(function (item, index) {
				item.dataset.originalOrder = String(index);

				var choiceButtons = item.querySelectorAll(
					"[data-evidence-choice]"
				);

				choiceButtons.forEach(function (button) {
					button.addEventListener("click", function () {
						handleChoice(item, button);
					});
				});
			});

			resetButton.addEventListener("click", resetActivity);

			updateActivity();

			function getPile(key) {
				return activity.querySelector(
					'[data-evidence-pile="' + key + '"]'
				);
			}

			function handleChoice(item, selectedButton) {
				var selectedChoice =
					selectedButton.dataset.evidenceChoice;
				var correctChoice = item.dataset.answer;

				var buttons = item.querySelectorAll(
					"[data-evidence-choice]"
				);
				var actions = item.querySelector(".evidence-actions");
				var feedback = item.querySelector(
					"[data-evidence-feedback]"
				);
				var message = item.querySelector(
					"[data-evidence-message]"
				);
				var hint = item.querySelector("[data-evidence-hint]");
				var explanation = item.querySelector(
					"[data-evidence-explanation]"
				);
				var placement = item.querySelector(
					"[data-evidence-placement]"
				);

				buttons.forEach(function (button) {
					button.classList.remove(
						"is-correct",
						"is-incorrect"
					);
				});

				if (selectedChoice !== correctChoice) {
					selectedButton.classList.add("is-incorrect");

					feedback.hidden = false;
					feedback.classList.remove("is-correct");
					feedback.classList.add("is-incorrect");

					message.innerHTML =
						"<strong>Not quite.</strong> " +
						"Read the hint and choose another category.";

					hint.hidden = false;
					explanation.hidden = true;

					return;
				}

				var destinationPile = getPile(correctChoice);
				var destinationItems =
					destinationPile.querySelector("[data-pile-items]");
				var pileLabel = destinationPile.dataset.pileLabel;

				selectedButton.classList.add("is-correct");

				buttons.forEach(function (button) {
					button.disabled = true;
				});

				actions.hidden = true;

				placement.hidden = false;
				placement.textContent = "Placed in: " + pileLabel;

				feedback.hidden = false;
				feedback.classList.remove("is-incorrect");
				feedback.classList.add("is-correct");

				message.innerHTML =
					"<strong>Placed correctly.</strong>";

				hint.hidden = true;
				explanation.hidden = false;

				item.classList.add("is-placed");
				destinationItems.appendChild(item);

				updateActivity();
				focusNextCard();
			}

			function updateActivity() {
				var placedCount = activity.querySelectorAll(
					"[data-evidence-item].is-placed"
				).length;

				progress.textContent =
					placedCount +
					" of " +
					items.length +
					" cards placed.";

				piles.forEach(function (pile) {
					var pileItems =
						pile.querySelector("[data-pile-items]");
					var emptyMessage =
						pile.querySelector("[data-pile-empty]");

					emptyMessage.hidden =
						pileItems.children.length > 0;
				});

				completedMessage.hidden =
					placedCount !== items.length;
			}

			function focusNextCard() {
				var nextButton = bank.querySelector(
					"[data-evidence-item] [data-evidence-choice]"
				);

				if (nextButton) {
					nextButton.focus();
				} else {
					resetButton.focus();
				}
			}

			function resetActivity() {
				items
					.slice()
					.sort(function (first, second) {
						return (
							Number(first.dataset.originalOrder) -
							Number(second.dataset.originalOrder)
						);
					})
					.forEach(function (item) {
						bank.appendChild(item);

						item.classList.remove("is-placed");

						var actions =
							item.querySelector(".evidence-actions");
						var buttons = item.querySelectorAll(
							"[data-evidence-choice]"
						);
						var placement = item.querySelector(
							"[data-evidence-placement]"
						);
						var feedback = item.querySelector(
							"[data-evidence-feedback]"
						);
						var message = item.querySelector(
							"[data-evidence-message]"
						);
						var hint =
							item.querySelector("[data-evidence-hint]");
						var explanation = item.querySelector(
							"[data-evidence-explanation]"
						);

						actions.hidden = false;

						buttons.forEach(function (button) {
							button.disabled = false;
							button.classList.remove(
								"is-correct",
								"is-incorrect"
							);
						});

						placement.hidden = true;
						placement.textContent = "";

						feedback.hidden = true;
						feedback.classList.remove(
							"is-correct",
							"is-incorrect"
						);

						message.textContent = "";
						hint.hidden = true;
						explanation.hidden = true;
					});

				updateActivity();

				var firstButton = bank.querySelector(
					"[data-evidence-choice]"
				);

				if (firstButton) {
					firstButton.focus();
				}
			}
		});
	}

	function startEvidenceSorts() {
		initialiseEvidenceSorts(document);
	}

	if (document.readyState === "loading") {
		document.addEventListener(
			"DOMContentLoaded",
			startEvidenceSorts
		);
	} else {
		startEvidenceSorts();
	}
})();