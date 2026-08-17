// GAGI SACCO — main.js
// Handles the mobile hamburger menu and touch-friendly dropdown toggle.
// Shared across all pages.

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // On touch/mobile, tapping "Products" opens the dropdown instead of a hover
  const dropdownParent = document.querySelector('.has-dropdown');
  if (dropdownParent) {
    const dropdownLink = dropdownParent.querySelector('a');
    dropdownLink.addEventListener('click', function (e) {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        dropdownParent.classList.toggle('open');
      }
    });
  }

  // Close mobile menu when a nav link is clicked
  nav?.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 860 && !link.closest('.has-dropdown')) {
        nav.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  });

  // ---------------------------------------------------------
  // products.html — category filter + sort
  // Only runs when the products grid is present on the page.
  // ---------------------------------------------------------
  const productsGrid = document.getElementById('products-grid');
  const categoryList = document.getElementById('category-list');
  const noResults = document.getElementById('no-results');
  const sortSelect = document.getElementById('sort-products');

  if (productsGrid && categoryList) {
    const cards = Array.from(productsGrid.querySelectorAll('.product-card'));

    // Filter the grid to show only cards matching the chosen category
    categoryList.addEventListener('click', function (e) {
      const link = e.target.closest('a[data-category]');
      if (!link) return;
      e.preventDefault();

      // Update the active state in the sidebar
      categoryList.querySelectorAll('a').forEach(function (a) {
        a.classList.remove('active');
      });
      link.classList.add('active');

      const category = link.dataset.category;
      let visibleCount = 0;

      cards.forEach(function (card) {
        const matches = category === 'all' || card.dataset.category === category;
        card.hidden = !matches;
        if (matches) visibleCount++;
      });

      if (noResults) noResults.hidden = visibleCount !== 0;
    });
  }

  // Sort the visible product cards alphabetically (or back to the
  // original "Popular" order) without reloading the page
  if (productsGrid && sortSelect) {
    const originalOrder = Array.from(productsGrid.children);

    sortSelect.addEventListener('change', function () {
      const cards = Array.from(productsGrid.querySelectorAll('.product-card'));

      if (sortSelect.value === 'popular') {
        originalOrder.forEach(function (card) { productsGrid.appendChild(card); });
        return;
      }

      cards.sort(function (a, b) {
        const nameA = a.dataset.name.toLowerCase();
        const nameB = b.dataset.name.toLowerCase();
        if (sortSelect.value === 'az') return nameA.localeCompare(nameB);
        if (sortSelect.value === 'za') return nameB.localeCompare(nameA);
        return 0;
      });

      cards.forEach(function (card) { productsGrid.appendChild(card); });
    });
  }

  // ---------------------------------------------------------
  // why-us.html — testimonial carousel
  // Only runs when the testimonial track is present on the page.
  // ---------------------------------------------------------
  const testimonialTrack = document.getElementById('testimonial-track');
  const testimonialPrev = document.getElementById('testimonial-prev');
  const testimonialNext = document.getElementById('testimonial-next');
  const testimonialDotsWrap = document.getElementById('testimonial-dots');

  if (testimonialTrack) {
    const slides = Array.from(testimonialTrack.querySelectorAll('.testimonial-slide'));
    const dots = testimonialDotsWrap ? Array.from(testimonialDotsWrap.querySelectorAll('.testimonial-dot')) : [];
    let current = 0;
    let autoplayTimer = null;

    function showSlide(index) {
      // wrap around in either direction
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle('active', i === current); });
      dots.forEach(function (dot, i) { dot.classList.toggle('active', i === current); });
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () { showSlide(current + 1); }, 7000);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    testimonialPrev?.addEventListener('click', function () {
      showSlide(current - 1);
      startAutoplay(); // reset the timer after manual interaction
    });
    testimonialNext?.addEventListener('click', function () {
      showSlide(current + 1);
      startAutoplay();
    });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.index));
        startAutoplay();
      });
    });

    showSlide(0);
    startAutoplay();
  }

  // ---------------------------------------------------------
// contact.html — contact form validation
// Client-side submission simulation
// ---------------------------------------------------------

const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm) {

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-\s()]{7,}$/;


  // -------------------------------------------------------
  // Show / clear field errors
  // -------------------------------------------------------

  function setFieldError(field, message) {
    const wrapper = field.closest('.form-field');

    if (!wrapper) return;

    const errorEl = wrapper.querySelector('.form-error');

    wrapper.classList.toggle('invalid', Boolean(message));

    if (errorEl) {
      errorEl.textContent = message || '';
    }
  }


  // -------------------------------------------------------
  // Validate individual field
  // -------------------------------------------------------

  function validateField(field) {

    const value = field.value.trim();

    // Required fields
    if (field.hasAttribute('required') && !value) {
      setFieldError(field, 'This field is required.');
      return false;
    }

    // Email validation
    if (
      field.type === 'email' &&
      value &&
      !emailPattern.test(value)
    ) {
      setFieldError(field, 'Enter a valid email address.');
      return false;
    }

    // Phone validation
    if (
      field.type === 'tel' &&
      value &&
      !phonePattern.test(value)
    ) {
      setFieldError(field, 'Enter a valid phone number.');
      return false;
    }

    // Field is valid
    setFieldError(field, '');

    return true;
  }


  // -------------------------------------------------------
  // Validate fields when user leaves them
  // -------------------------------------------------------

  const fields = Array.from(
    contactForm.querySelectorAll('input, select, textarea')
  );

  fields.forEach(function (field) {

    field.addEventListener('blur', function () {
      validateField(field);
    });

  });


  // -------------------------------------------------------
  // FORM SUBMISSION
  // -------------------------------------------------------

  contactForm.addEventListener('submit', function (event) {

    event.preventDefault();

    // Validate every field
    const isValid = fields
      .map(function (field) {
        return validateField(field);
      })
      .every(Boolean);


    // Stop if validation failed
    if (!isValid) {
      return;
    }


    // -----------------------------------------------------
    // SIMULATE SUCCESSFUL SUBMISSION
    // -----------------------------------------------------

    if (formSuccess) {

      // Show success message
      formSuccess.hidden = false;

      // Scroll to the success message
      formSuccess.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }


    // -----------------------------------------------------
    // Reset the form after successful submission
    // -----------------------------------------------------

    contactForm.reset();


    // Clear validation states
    fields.forEach(function (field) {
      setFieldError(field, '');
    });

  });

}

  // ---------------------------------------------------------
  // quote.html — 4-step "Request a Quote" wizard
  // Only runs when the quote form is present on the page.
  // Only Step 1's fields are fully built out per the mockup;
  // Steps 2-4 are placeholders so the Next/Back flow works
  // end to end — fill in their fields the same way as Step 1.
  // ---------------------------------------------------------
  const quoteForm = document.getElementById('quote-form');

  if (quoteForm) {
    const TOTAL_STEPS = 4;
    const stepLabel = document.getElementById('step-label');
    const stepHeading = document.getElementById('step-heading');
    const stepIntro = document.getElementById('step-intro');
    const stepperItems = Array.from(document.querySelectorAll('.stepper-item'));
    const stepFieldsets = Array.from(document.querySelectorAll('.quote-step'));
    const nextBtn = document.getElementById('next-step');
    const backBtn = document.getElementById('back-step');
    const saveLaterBtn = document.getElementById('save-later');
    const quoteSuccess = document.getElementById('form-success');

    // Content shown in the heading/intro area for each step
    const stepInfo = {
      1: { heading: 'Project &amp; Contact Information', intro: 'Please provide your contact details and basic project information.', nextLabel: 'Next: Products Needed' },
      2: { heading: 'Products Needed', intro: 'Select the products you need and roughly how much of each.', nextLabel: 'Next: Project Details' },
      3: { heading: 'Project Details', intro: 'Add any extra details, drawings or specifications for your project.', nextLabel: 'Next: Review &amp; Submit' },
      4: { heading: 'Review &amp; Submit', intro: 'Review everything below, then submit your request to our team.', nextLabel: '' }
    };

    let currentStep = 1;

    function setFieldError(field, message) {
      const wrapper = field.closest('.form-field');
      if (!wrapper) return;
      const errorEl = wrapper.querySelector('.form-error');
      wrapper.classList.toggle('invalid', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
    }

    function validateField(field) {
      const value = field.value.trim();
      if (field.hasAttribute('required') && !value) {
        setFieldError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldError(field, 'Enter a valid email address.');
        return false;
      }
      setFieldError(field, '');
      return true;
    }

    // Only validate the fields belonging to the currently visible step
    function validateCurrentStep() {
      const activeFieldset = document.querySelector('.quote-step.active');
      if (!activeFieldset) return true;
      const fields = Array.from(activeFieldset.querySelectorAll('input, select, textarea'));
      return fields.map(validateField).every(Boolean);
    }

    function goToStep(step) {
      currentStep = step;

      // Swap the visible fieldset
      stepFieldsets.forEach(function (fs) {
        fs.classList.toggle('active', Number(fs.dataset.step) === step);
      });

      // Update the stepper circles/labels
      stepperItems.forEach(function (item) {
        const itemStep = Number(item.dataset.step);
        item.classList.toggle('active', itemStep === step);
        item.classList.toggle('completed', itemStep < step);
      });

      // Update heading/intro text
      const info = stepInfo[step];
      if (stepLabel) stepLabel.textContent = 'Step ' + step + ' of ' + TOTAL_STEPS;
      if (stepHeading) stepHeading.innerHTML = info.heading;
      if (stepIntro) stepIntro.textContent = info.intro;
      if (nextBtn) nextBtn.innerHTML = info.nextLabel + ' <span aria-hidden="true">&rarr;</span>';

      // Toggle which action row (steps 1-3 vs step 4) is visible
      document.querySelectorAll('.form-actions').forEach(function (row) {
        const forSteps = row.dataset.actionsFor.split(',').map(Number);
        row.hidden = !forSteps.includes(step);
      });

      quoteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    nextBtn?.addEventListener('click', function () {
      if (!validateCurrentStep()) return;
      if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    });

    backBtn?.addEventListener('click', function () {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    saveLaterBtn?.addEventListener('click', function () {
      // Placeholder for a real "save progress" call (e.g. localStorage or an API request)
      alert('Your progress has been saved. You can continue this quote request later.');
    });

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateCurrentStep()) return;

      // Simulate sending — replace with a real request, e.g.:
      // fetch(quoteForm.action, { method: 'POST', body: new FormData(quoteForm) })
      if (quoteSuccess) {
        quoteSuccess.hidden = false;
        quoteSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    goToStep(1);
  }
});

/* ==========================================================================
   Developer Contact Modal
   ========================================================================== */

const developerCTA = document.getElementById("developer-cta-button");
const developerModal = document.getElementById("developer-modal");
const developerModalClose = document.getElementById(
  "developer-modal-close"
);

if (developerCTA && developerModal) {

  function openDeveloperModal() {
    developerModal.hidden = false;
    document.body.classList.add("modal-open");

    developerModalClose?.focus();
  }


  function closeDeveloperModal() {
    developerModal.hidden = true;
    document.body.classList.remove("modal-open");

    developerCTA.focus();
  }


  /* Open modal */
  developerCTA.addEventListener(
    "click",
    openDeveloperModal
  );


  /* Close with X */
  developerModalClose?.addEventListener(
    "click",
    closeDeveloperModal
  );


  /* Close by clicking overlay */
  developerModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target.hasAttribute("data-modal-close")
      ) {
        closeDeveloperModal();
      }
    }
  );


  /* Close with Escape */
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        !developerModal.hidden
      ) {
        closeDeveloperModal();
      }
    }
  );
}