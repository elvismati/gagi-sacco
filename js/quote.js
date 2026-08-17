/* ==========================================================================
   GAGI SACCO — Quote Request
   Handles:
   - 2-step quote form
   - Product selection
   - Quantity fields
   - Product preselection from URL
   - Customer validation
   - Quote summary
   - Success state
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quote-form");

  // Only run on quote.html
  if (!quoteForm) return;

  /* ==========================================================================
     ELEMENTS
     ========================================================================== */

  const steps = document.querySelectorAll(".quote-step");
  const progressSteps = document.querySelectorAll(".quote-progress-step");

  const stepHeading = document.getElementById("quote-step-heading");
  const stepDescription = document.getElementById(
    "quote-step-description"
  );

  const nextButton = document.getElementById("next-step");
  const backButton = document.getElementById("back-step");
  const editProductsButton = document.getElementById("edit-products");

  const productCards = document.querySelectorAll(".quote-product-card");

  const validationMessage = document.getElementById(
    "product-validation-message"
  );

  const summaryList = document.getElementById("quote-summary-list");

  const successMessage = document.getElementById("form-success");

  const progressContainer = document.querySelector(".quote-progress");

  let currentStep = 1;


  /* ==========================================================================
     STEP CONTENT
     ========================================================================== */

  const stepContent = {
    1: {
      heading: "What do you need?",
      description:
        "Select the products you need and provide the estimated quantities."
    },

    2: {
      heading: "Tell us about yourself",
      description:
        "Give us your contact and project details so we can prepare your quote."
    }
  };


  /* ==========================================================================
     SHOW STEP
     ========================================================================== */

  function showStep(stepNumber) {
    currentStep = stepNumber;

    /* ----------------------------------
       Show correct fieldset
       ---------------------------------- */

    steps.forEach((step) => {
      const stepValue = Number(step.dataset.step);

      step.classList.toggle(
        "active",
        stepValue === stepNumber
      );
    });


    /* ----------------------------------
       Update progress indicator
       ---------------------------------- */

    progressSteps.forEach((step) => {
      const stepValue = Number(
        step.dataset.progressStep
      );

      step.classList.toggle(
        "active",
        stepValue === stepNumber
      );

      // Mark previous steps as completed
      step.classList.toggle(
        "completed",
        stepValue < stepNumber
      );
    });


    /* ----------------------------------
       Update heading
       ---------------------------------- */

    if (stepContent[stepNumber]) {
      if (stepHeading) {
        stepHeading.textContent =
          stepContent[stepNumber].heading;
      }

      if (stepDescription) {
        stepDescription.textContent =
          stepContent[stepNumber].description;
      }
    }


    /* ----------------------------------
       Update product summary
       ---------------------------------- */

    if (stepNumber === 2) {
      updateQuoteSummary();
    }


    /* ----------------------------------
       Scroll to form
       ---------------------------------- */

    const formWrap =
      quoteForm.closest(".quote-form-wrap");

    if (formWrap) {
      formWrap.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }


  /* ==========================================================================
     PRODUCT SELECTION
     ========================================================================== */

  productCards.forEach((card) => {
    const checkbox =
      card.querySelector('input[type="checkbox"]');

    const quantityInput =
      card.querySelector('input[type="number"]');

    if (!checkbox || !quantityInput) return;


    checkbox.addEventListener("change", () => {
      const selected = checkbox.checked;


      /* ----------------------------------
         Visual selected state
         ---------------------------------- */

      card.classList.toggle(
        "selected",
        selected
      );


      /* ----------------------------------
         Enable / disable quantity
         ---------------------------------- */

      quantityInput.disabled = !selected;


      /* ----------------------------------
         Clear quantity when unselected
         ---------------------------------- */

      if (!selected) {
        quantityInput.value = "";
      }


      /* ----------------------------------
         Focus quantity when selected
         ---------------------------------- */

      if (selected) {
        quantityInput.focus();
      }


      /* ----------------------------------
         Hide validation message
         ---------------------------------- */

      if (validationMessage) {
        validationMessage.hidden = true;
      }
    });


    /* ----------------------------------
       Prevent quantity click from
       triggering the card/checkbox
       ---------------------------------- */

    quantityInput.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
      }
    );


    quantityInput.addEventListener(
      "input",
      () => {
        if (validationMessage) {
          validationMessage.hidden = true;
        }
      }
    );
  });


  /* ==========================================================================
     GET SELECTED PRODUCTS
     ========================================================================== */

  function getSelectedProducts() {
    const selectedProducts = [];

    productCards.forEach((card) => {
      const checkbox =
        card.querySelector('input[type="checkbox"]');

      const quantityInput =
        card.querySelector('input[type="number"]');

      if (!checkbox || !quantityInput) return;


      if (checkbox.checked) {
        selectedProducts.push({
          value: checkbox.value,

          name:
            checkbox.dataset.productName ||
            checkbox.value,

          quantity:
            quantityInput.value.trim()
        });
      }
    });

    return selectedProducts;
  }


  /* ==========================================================================
     VALIDATE PRODUCTS
     ========================================================================== */

  function validateProducts() {
    const selectedProducts =
      getSelectedProducts();


    /* ----------------------------------
       No product selected
       ---------------------------------- */

    if (selectedProducts.length === 0) {
      if (validationMessage) {
        validationMessage.textContent =
          "Please select at least one product before continuing.";

        validationMessage.hidden = false;
      }

      return false;
    }


    /* ----------------------------------
       Check quantities
       ---------------------------------- */

    const missingQuantity =
      selectedProducts.some((product) => {
        return (
          !product.quantity ||
          Number(product.quantity) <= 0
        );
      });


    if (missingQuantity) {
      if (validationMessage) {
        validationMessage.textContent =
          "Please enter a quantity for each selected product.";

        validationMessage.hidden = false;
      }

      return false;
    }


    /* ----------------------------------
       Valid
       ---------------------------------- */

    if (validationMessage) {
      validationMessage.hidden = true;
    }

    return true;
  }


  /* ==========================================================================
     UPDATE QUOTE SUMMARY
     ========================================================================== */

  function updateQuoteSummary() {
    if (!summaryList) return;

    const selectedProducts =
      getSelectedProducts();


    summaryList.innerHTML = "";


    selectedProducts.forEach((product) => {
      const item =
        document.createElement("li");


      item.innerHTML = `
        <span class="summary-product-name">
          ${escapeHTML(product.name)}
        </span>

        <span class="summary-quantity">
          Qty: ${escapeHTML(product.quantity)}
        </span>
      `;


      summaryList.appendChild(item);
    });


    /* ----------------------------------
       Handle empty summary
       ---------------------------------- */

    if (selectedProducts.length === 0) {
      summaryList.innerHTML = `
        <li class="summary-empty">
          No products selected.
        </li>
      `;
    }
  }


  /* ==========================================================================
     ESCAPE HTML
     Prevents user-entered values from being
     inserted directly as HTML.
     ========================================================================== */

  function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
  }


  /* ==========================================================================
     NEXT BUTTON
     ========================================================================== */

  if (nextButton) {
    nextButton.addEventListener("click", () => {

      if (!validateProducts()) {
        return;
      }

      showStep(2);
    });
  }


  /* ==========================================================================
     BACK BUTTON
     ========================================================================== */

  if (backButton) {
    backButton.addEventListener("click", () => {
      showStep(1);
    });
  }


  /* ==========================================================================
     EDIT PRODUCTS
     ========================================================================== */

  if (editProductsButton) {
    editProductsButton.addEventListener(
      "click",
      () => {
        showStep(1);
      }
    );
  }


  /* ==========================================================================
     CUSTOMER VALIDATION
     ========================================================================== */

  function validateCustomerDetails() {
    let valid = true;


    const requiredFields = [
      {
        id: "full-name",
        message: "Please enter your full name."
      },

      {
        id: "phone",
        message: "Please enter your phone number."
      },

      {
        id: "project-location",
        message:
          "Please select your project location."
      }
    ];


    /* ----------------------------------
       Required fields
       ---------------------------------- */

    requiredFields.forEach((field) => {
      const input =
        document.getElementById(field.id);

      if (!input) return;


      const wrapper =
        input.closest(".form-field");

      const error =
        wrapper?.querySelector(".form-error");


      if (!input.value.trim()) {
        valid = false;

        wrapper?.classList.add(
          "has-error"
        );

        if (error) {
          error.textContent =
            field.message;
        }

      } else {
        wrapper?.classList.remove(
          "has-error"
        );

        if (error) {
          error.textContent = "";
        }
      }
    });


    /* ----------------------------------
       Phone validation
       ---------------------------------- */

    const phone =
      document.getElementById("phone");


    if (phone && phone.value.trim()) {
      const phonePattern =
        /^[+]?[0-9\s()-]{9,20}$/;

      const wrapper =
        phone.closest(".form-field");

      const error =
        wrapper?.querySelector(".form-error");


      if (!phonePattern.test(phone.value.trim())) {
        valid = false;

        wrapper?.classList.add(
          "has-error"
        );

        if (error) {
          error.textContent =
            "Please enter a valid phone number.";
        }
      }
    }


    /* ----------------------------------
       Email validation
       ---------------------------------- */

    const email =
      document.getElementById("email");


    if (email && email.value.trim()) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const wrapper =
        email.closest(".form-field");

      const error =
        wrapper?.querySelector(".form-error");


      if (!emailPattern.test(email.value.trim())) {
        valid = false;

        wrapper?.classList.add(
          "has-error"
        );

        if (error) {
          error.textContent =
            "Please enter a valid email address.";
        }

      } else {
        wrapper?.classList.remove(
          "has-error"
        );

        if (error) {
          error.textContent = "";
        }
      }
    }


    return valid;
  }


  /* ==========================================================================
     REMOVE ERRORS WHEN USER EDITS FIELD
     ========================================================================== */

  quoteForm
    .querySelectorAll(
      "input:not([type='checkbox']), select, textarea"
    )
    .forEach((field) => {

      field.addEventListener(
        "input",
        () => {
          clearFieldError(field);
        }
      );


      field.addEventListener(
        "change",
        () => {
          clearFieldError(field);
        }
      );
    });


  function clearFieldError(field) {
    const wrapper =
      field.closest(".form-field");

    if (!wrapper) return;


    wrapper.classList.remove(
      "has-error"
    );


    const error =
      wrapper.querySelector(".form-error");


    if (error) {
      error.textContent = "";
    }
  }


  /* ==========================================================================
     FORM SUBMISSION
     ========================================================================== */

  quoteForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      /* ----------------------------------
         Validate products
         ---------------------------------- */

      if (!validateProducts()) {
        showStep(1);
        return;
      }


      /* ----------------------------------
         Validate customer information
         ---------------------------------- */

      if (!validateCustomerDetails()) {
        return;
      }


      /* ----------------------------------
         Collect quote data
         ---------------------------------- */

      const quoteData = {
        products: getSelectedProducts(),

        customer: {
          name:
            document.getElementById("full-name")
              ?.value.trim() || "",

          phone:
            document.getElementById("phone")
              ?.value.trim() || "",

          email:
            document.getElementById("email")
              ?.value.trim() || "",

          location:
            document.getElementById(
              "project-location"
            )?.value || "",

          projectType:
            document.getElementById(
              "project-type"
            )?.value || "",

          delivery:
            document.getElementById(
              "delivery"
            )?.value || "",

          notes:
            document.getElementById(
              "notes"
            )?.value.trim() || ""
        }
      };


      console.log(
        "Quote Request:",
        quoteData
      );


      /* ----------------------------------
         Hide form steps
         ---------------------------------- */

      steps.forEach((step) => {
        step.style.display = "none";
      });


      /* ----------------------------------
         Hide progress
         ---------------------------------- */

      if (progressContainer) {
        progressContainer.style.display =
          "none";
      }


      /* ----------------------------------
         Hide heading
         ---------------------------------- */

      if (stepHeading) {
        stepHeading.style.display =
          "none";
      }


      if (stepDescription) {
        stepDescription.style.display =
          "none";
      }


      /* ----------------------------------
         Show success message
         ---------------------------------- */

      if (successMessage) {
        successMessage.hidden = false;

        successMessage.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }


      /*
       * IMPORTANT:
       *
       * This currently only completes the
       * frontend process.
       *
       * Later we can send quoteData to:
       *
       * PHP
       * Formspree
       * EmailJS
       * WhatsApp
       * Database
       * etc.
       */
    }
  );


  /* ==========================================================================
     PRESELECT PRODUCT FROM URL
     
     Example:
     quote.html?product=cabro-blocks
     
     This is what allows:
     
     Products page:
     Request a Quote
     
     to open:
     
     quote.html?product=cabro-blocks
     
     with Cabro Blocks already selected.
     ========================================================================== */

  function preselectProductFromURL() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const product =
      params.get("product");


    if (!product) {
      return;
    }


    /* ----------------------------------
       Find matching checkbox
       ---------------------------------- */

    const matchingCheckbox =
      Array.from(
        document.querySelectorAll(
          '.quote-product-card input[type="checkbox"]'
        )
      ).find(
        (checkbox) =>
          checkbox.value === product
      );


    if (!matchingCheckbox) {
      console.warn(
        `Quote product "${product}" was not found.`
      );

      return;
    }


    /* ----------------------------------
       Select product
       ---------------------------------- */

    matchingCheckbox.checked = true;


    const card =
      matchingCheckbox.closest(
        ".quote-product-card"
      );


    const quantityInput =
      card?.querySelector(
        'input[type="number"]'
      );


    /* ----------------------------------
       Apply selected state
       ---------------------------------- */

    card?.classList.add(
      "selected"
    );


    /* ----------------------------------
       Enable quantity
       ---------------------------------- */

    if (quantityInput) {
      quantityInput.disabled = false;
    }


    /* ----------------------------------
       Focus quantity
       ---------------------------------- */

    if (quantityInput) {
      setTimeout(() => {
        quantityInput.focus();
      }, 300);
    }


    /* ----------------------------------
       Scroll to selected product
       ---------------------------------- */

    if (card) {
      setTimeout(() => {
        card.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 300);
    }


    /*
     * We intentionally DO NOT remove the
     * URL parameter here.
     *
     * Keeping:
     *
     * ?product=cabro-blocks
     *
     * makes debugging easier and does not
     * affect the form.
     */
  }


  /* ==========================================================================
     INITIALIZE
     ========================================================================== */

  showStep(1);

  preselectProductFromURL();

});