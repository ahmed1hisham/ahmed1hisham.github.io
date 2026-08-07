(function () {
  "use strict";

  var menuToggle = document.querySelector(".navbar-toggler");
  var menuOverlay = document.querySelector(".overlay");
  var navigation = document.querySelector(".navbar-collapse");
  var navLinks = Array.from(document.querySelectorAll(".navbar-nav .nav-link"));
  var activeModal = null;
  var lastFocusedElement = null;

  function setMenuOpen(isOpen) {
    menuToggle.classList.toggle("active", isOpen);
    menuOverlay.classList.toggle("active", isOpen);
    navigation.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  menuToggle.addEventListener("click", function () {
    setMenuOpen(!navigation.classList.contains("active"));
  });

  menuOverlay.addEventListener("click", function () {
    setMenuOpen(false);
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  function updateStrictNavigation() {
    document
      .querySelector(".nav-scroll")
      .classList.toggle("nav-strict", window.scrollY >= 50);
  }

  window.addEventListener("scroll", updateStrictNavigation, { passive: true });
  updateStrictNavigation();

  if ("IntersectionObserver" in window) {
    var sections = navLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.forEach(function (link) {
            link.parentElement.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-35% 0px -60%", threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function prepareProjectTrigger(trigger) {
    var targetSelector = trigger.getAttribute("data-src");
    var target = targetSelector && document.querySelector(targetSelector);

    if (!target) {
      return null;
    }

    trigger.setAttribute("href", targetSelector);

    if (!trigger.textContent.trim() && !trigger.hasAttribute("aria-label")) {
      var title = target.querySelector("h2");
      trigger.setAttribute(
        "aria-label",
        "View " + (title ? title.textContent.trim() : "project") + " details"
      );
    }

    return target;
  }

  function loadProjectGallery(target) {
    var projectTitle = target.querySelector("h2");
    var title = projectTitle ? projectTitle.textContent.trim() : "Project";

    target.querySelectorAll("img[data-src]").forEach(function (image, index) {
      image.loading = "lazy";
      image.decoding = "async";
      image.alt = image.alt || title + " screenshot " + (index + 1);
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
    });
  }

  function focusableElements(modal) {
    return Array.from(
      modal.querySelectorAll(
        "button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter(function (element) {
      return element.offsetParent !== null;
    });
  }

  function closeProjectModal() {
    if (!activeModal) {
      return;
    }

    activeModal.classList.remove("is-open");
    activeModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    activeModal = null;

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function openProjectModal(target, trigger) {
    loadProjectGallery(target);
    lastFocusedElement = trigger;
    activeModal = target;

    var title = target.querySelector("h2");
    if (title && !title.id) {
      title.id = target.id + "-title";
    }

    target.setAttribute("role", "dialog");
    target.setAttribute("aria-modal", "true");
    target.setAttribute("aria-hidden", "false");
    if (title) {
      target.setAttribute("aria-labelledby", title.id);
    }

    var closeButton = target.querySelector(".project-modal-close");
    if (!closeButton) {
      closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "project-modal-close";
      closeButton.setAttribute("aria-label", "Close project details");
      closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';
      closeButton.addEventListener("click", closeProjectModal);
      target.appendChild(closeButton);
    }

    target.classList.add("is-open");
    document.body.classList.add("modal-open");
    closeButton.focus();
  }

  document.querySelectorAll("[data-fancybox][data-src^='#']").forEach(function (trigger) {
    var target = prepareProjectTrigger(trigger);

    if (!target) {
      return;
    }

    target.setAttribute("aria-hidden", "true");

    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      openProjectModal(target, trigger);
    });
  });

  document.querySelectorAll(".mh-portfolio-modal").forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeProjectModal();
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (!activeModal) {
      return;
    }

    if (event.key === "Escape") {
      closeProjectModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    var focusable = focusableElements(activeModal);
    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
