"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );
  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener("click", function () {
        let target = $el.dataset.target;
        let $target = document.getElementById(target);

        $el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }

  let $notification = document.querySelectorAll(".notification .delete") || [];

  $notification.forEach(($delete) => {
    // console.log($delete.parentNode);
    $notification = $delete.parentNode;

    $delete.addEventListener("click", () => {
      $notification.parentNode.removeChild($notification);
    });
  });
});

function supprimerToucheEspace() {
  if (event.keyCode == 32) {
    alert("Espace interdit dans champs");
    return false;
  }
}