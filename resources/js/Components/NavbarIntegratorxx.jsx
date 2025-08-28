import React, { useEffect } from "react";

const NavbarIntegrator = () => {
  useEffect(() => {
    // Esperar a que AdminLTE cargue
    setTimeout(() => {
      const navbarNav = document.querySelector('.navbar-nav.ml-auto');
      if (navbarNav) {
        // Agregar elementos al navbar existente de AdminLTE
        const addNavbarItem = (icon, title, onClick) => {
          const li = document.createElement('li');
          li.className = 'nav-item';
          
          const button = document.createElement('button');
          button.className = 'nav-link';
          button.style = 'border: none; background: none; cursor: pointer;';
          button.innerHTML = `<i class="${icon}"></i>`;
          button.title = title;
          button.onclick = onClick;
          
          li.appendChild(button);
          navbarNav.appendChild(li);
        };

        // Agregar botones al navbar
        addNavbarItem('fas fa-expand-arrows-alt', 'Pantalla completa', () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        });

        addNavbarItem('fas fa-bell text-warning', 'Notificaciones', () => {
          window.location.href = '/notificationsList';
        });

        // Agregar dropdown de usuario
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
          <a class="nav-link" data-toggle="dropdown" href="#">
            <i class="fas fa-user-circle"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <a href="/profile" class="dropdown-item">
              <i class="fas fa-user mr-2 text-primary"></i> Perfil
            </a>
            <div class="dropdown-divider"></div>
            <form action="/logout" method="POST" style="display: inline;">
              <input type="hidden" name="_token" value="${window.Laravel?.csrfToken || ''}">
              <button type="submit" class="dropdown-item" style="border: none; background: none; cursor: pointer;">
                <i class="fas fa-sign-out-alt mr-2 text-danger"></i> Salir
              </button>
            </form>
          </div>
        `;
        navbarNav.appendChild(userDropdown);
      }
    }, 1000);
  }, []);

  return null;
};

export default NavbarIntegrator;