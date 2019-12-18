let DB;


// selectores desde la interfaz

const form = document.querySelector('form'),
     nombreMascota = document.querySelector('#mascota'),
     nombreCliente = document.querySelector('#cliente'),
     telefono = document.querySelector('#telefono'),
     fecha = document.querySelector('#fecha'),
     hora = document.querySelector('#hora'),
     sintomas = document.querySelector('#sintomas'),
     citas = document.querySelector('#citas'),
     headingAdministra = document.querySelector('#administra');


     // esperando a que el DOM este Listo

document.addEventListener('DOMContentLoaded', ()=> {
     // crear la Base de Datos
     let crearDB = window.indexedDB.open('citas',1 );

     // si hay un Error
     crearDB.onerror = function() {
          console.log('Hubo un Error al Conectar');
     }

     // conexion exitosa
     crearDB.onsuccess = function() {
         // console.log('Conexion Exitosa a IndexDB');

          //asignar a la base de datos
          DB = crearDB.result;

          // funcion para limpiar y mostrar citas
          mostrarCitas();
     }

     // creando el Schema de la base de datos 
     crearDB.onupgradeneeded = function(e) {
          // el evento es la misma base de datos !!
          let db = e.target.result;

          // define el ObjectStore   require 2 params  el DB name & the Options
          // keyPath es el Index de la DataBase!!
          let objectStore = db.createObjectStore('citas', {keyPath: 'key', autoIncrement: true} );

          // create el Index de la DB, CreateIndex , require 3 params: Name, Keypath y Options

          objectStore.createIndex('mascota', 'mascota' , {unique: false});  // Unique  deberia ser true, pero esto es un demo!!
          objectStore.createIndex('cliente', 'cliente' , {unique: false});
          objectStore.createIndex('telefono', 'telefono' , {unique: true});
          objectStore.createIndex('fecha', 'fecha' , {unique: false});
          objectStore.createIndex('hora', 'hora' , {unique: false});
          objectStore.createIndex('sintomas', 'sintomas' , {unique: false});
  
     }
     // envio del formulario
     form.addEventListener('submit', agregarDatos);

          // agregar los datos al form!!
     function agregarDatos(e){
          e.preventDefault();

          const nuevaCita = {
               mascota: nombreMascota.value,
               cliente: nombreCliente.value,
               telefono: telefono.value,
               fecha: fecha.value,
               hora: hora.value,
               sintomas: sintomas.value

          }
         // console.log(nuevaCita);

         //  insertando las transacciones en IndexedDB
         let transaction = DB.transaction(['citas'], 'readwrite');
         let objectStore = transaction.objectStore('citas');

         // console.log(objectStore);
         let peticion = objectStore.add(nuevaCita);
         //console.log(peticion);


         peticion.onsuccess = () => {
              form.reset();
         }
         transaction.oncomplete = () => {
              console.log('cita agregada');
              // funcion para mostrar las citas
              mostrarCitas();
         }
         transaction.onerror = () => {
              console.log('hubo un error');
         }
     }

     function mostrarCitas(){
         // clear  citas anteriores
         while(citas.firstChild) {
              citas.removeChild(citas.firstChild);
         } 
         // crear un objectStore
         let objectStore = DB.transaction('citas').objectStore('citas');

         // retornando la peticion con opencursor
         objectStore.openCursor().onsuccess = function(e) {
              // posiciona el cursos en el registro indicado
              let cursor = e.target.result;
              //console.log(cursor);

              if(cursor) {
                   let citasHTML = document.createElement('li');
                   citasHTML.setAttribute('data-cita-id', cursor.value.key);
                   citasHTML.classList.add('list-group-item');

                   citasHTML.innerHTML = `
                              <p class="font-weight-bold"> Mascota:<span class="text-info"> ${cursor.value.mascota} </span></P>
                              <p class="font-weight-bold"> Cliente:<span class="text-primary"> ${cursor.value.cliente} </span></P>
                              <p class="font-weight-bold"> Telefono:<span class=""> ${cursor.value.telefono} </span></P>
                              <p class="font-weight-bold"> Fecha:<span class="text-warning"> ${cursor.value.fecha} </span></P>
                              <p class="font-weight-bold"> Hora:<span class="text-success"> ${cursor.value.hora} </span></P>
                              <p class="font-weight-bold"> Sintomas:<span class=""> ${cursor.value.sintomas} </span></P>

                  
                   `;

                   // boton para eliminar las citas
                   const botonBorrar = document.createElement('button');
                   botonBorrar.classList.add('borrar', 'btn', 'btn-dark');
                   botonBorrar.innerHTML = '<span aria-hidden="true"> X </span> Eliminar';
                   botonBorrar.onclick = borrarCita;
                   citasHTML.appendChild(botonBorrar);

                   // append  en el padre
                   citas.appendChild(citasHTML);

                    // realiza la consulta de todos los registros
                   cursor.continue();
              }else{
                   // cuando NO hay registros
                   if(!citas.firstChild){
                        headingAdministra.textContent = 'Agrega una Cita ';
                        headingAdministra.classList.add('text-primary')
                        let listado = document.createElement('p');
                        listado.classList.add('text-center', 'bg-warning');
                        listado.textContent = ' No hay Registros Aún';
                        citas.appendChild(listado);
                   }else{
                        headingAdministra.textContent = 'Administra tus Citas '
                        headingAdministra.classList.add('text-secondary')
                   }
              }

         }
     }


     // funcion para eliminar cada cita 

     function borrarCita(e) {
          let citaID = Number(e.target.parentElement.getAttribute('data-cita-id') );

          //  Eliminando las transacciones en IndexedDB
          let transaction = DB.transaction(['citas'], 'readwrite');
          let objectStore = transaction.objectStore('citas');

          // console.log(objectStore);
          let peticion = objectStore.delete(citaID);

          // quitando las citas del DOM
          transaction.oncomplete = () => {
               e.target.parentElement.parentElement.removeChild( e.target.parentElement );

               if (!citas.firstChild) {
                    headingAdministra.textContent = 'Agrega una Cita ';
                    headingAdministra.classList.add('text-primary')
                    let listado = document.createElement('p');
                    listado.classList.add('text-center', 'bg-warning');
                    listado.textContent = ' No hay Registros Aún';
                    citas.appendChild(listado);
               } else {
                    headingAdministra.textContent = 'Administra tus Citas '
                    headingAdministra.classList.add('text-secondary')
               }
          }
     }

})     