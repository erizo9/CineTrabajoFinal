document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    let butacas = [];

    if (movieId) {
        try {
            const response = await fetch(`http://localhost:3001/api/movies/${movieId}`);
            const movieData = await response.json();
            console.log(movieData);

            addImages(movieData, movieId);

            // Ahora que tenemos el movieId, podemos inicializar las butacas
            const contenedorButacas = document.getElementById('contenedorButacas');
            butacas = Array.from(contenedorButacas.querySelectorAll('.butaca'));

            butacas.forEach(butaca => {
                verificarButaca(butaca);
                butaca.addEventListener('click', () => {
                    toggleButaca(butaca);
                    verificarButaca(butaca);
                });
            });

            // Llama a cargarEstadoButacas después de cargar las butacas para la película actual
            cargarEstadoButacas(movieId);
        } catch (error) {
            console.error('Error al obtener la información de la película:', error);
        }
    } else {
        console.error('ID de película no proporcionado en la URL');
    }

    function addImages(movie, movieId) {
        const movieDetails = document.getElementById('movieDetails');
        const titleElement = document.createElement('h1');
        titleElement.textContent = 'Detalles de la Película';

        const img = document.createElement('img');
        img.src = `/imagenes/${movie.image}`;
        img.alt = movie.title;
        img.setAttribute('data-movie-id', movie.id);
        movieDetails.insertBefore(img, movieDetails.firstChild);
    }

    async function verificarButaca(butaca) {
        try {
            const response = await fetch(`http://localhost:3001/api/verificar-butacas?butacas=${butaca.id}`);
            const data = await response.json();

            butaca.classList.toggle('ocupada', data.disponibles.length === 0);
        } catch (error) {
            console.error('Error al verificar butacas:', error);
        }
    }

    function toggleButaca(butaca) {
        if (!butaca.classList.contains('ocupada') && !butaca.classList.contains('comprada')) {
            butaca.classList.toggle('selected');
        }
    }

    function comprarButacas(movieId) {
        const butacasSeleccionadas = butacas.filter(butaca => butaca.classList.contains('selected'));
        const butacasOcupadas = butacasSeleccionadas.filter(butaca => butaca.classList.contains('ocupada'));

        if (butacasSeleccionadas.length === 0) {
            alert('Selecciona al menos una butaca antes de comprar.');
        } else if (butacasOcupadas.length > 0) {
            const ocupadasIds = butacasOcupadas.map(butaca => butaca.id).join(', ');
            alert(`Lo sentimos, las siguientes butacas seleccionadas están ocupadas: ${ocupadasIds}`);
            butacasOcupadas.forEach(butaca => butaca.classList.remove('selected'));
        } else {
            // Obtiene las butacas compradas actuales desde localStorage
            const butacasCompradas = JSON.parse(localStorage.getItem('butacasCompradas')) || {};

            // Asegura que butacasCompradas[movieId] sea un array antes de usar push
            if (!Array.isArray(butacasCompradas[movieId])) {
                butacasCompradas[movieId] = [];
            }

            // Agrega las nuevas butacas compradas a la lista de la película actual
            butacasSeleccionadas.forEach(butaca => {
                if (!butacasCompradas[movieId].includes(butaca.id)) {
                    butacasCompradas[movieId].push(butaca.id);
                }
            });

            // Almacena la lista actualizada en localStorage
            localStorage.setItem('butacasCompradas', JSON.stringify(butacasCompradas));

            const seleccionadasIds = butacasSeleccionadas.map(butaca => butaca.id).join(', ');
            alert(`¡Compra exitosa! Butacas seleccionadas: ${seleccionadasIds}`);

            // Después de la compra, marca las butacas como compradas y deshabilita el evento click
            butacasSeleccionadas.forEach(butaca => {
                butaca.classList.add('comprada');
                butaca.classList.remove('selected');
                butaca.removeEventListener('click', toggleButaca);
            });
        }
    }

    function cargarEstadoButacas(movieId) {
        const butacasCompradas = JSON.parse(localStorage.getItem('butacasCompradas')) || {};
        const butacasCompradasParaPelicula = butacasCompradas[movieId] || [];

        butacas.forEach(butaca => {
            if (butacasCompradasParaPelicula.includes(butaca.id)) {
                butaca.classList.add('comprada');
                butaca.removeEventListener('click', toggleButaca);
            }
        });
    }

    const comprarBtn = document.getElementById('comprarBtn');
    comprarBtn.addEventListener('click', () => comprarButacas(movieId));

//     function reiniciarButacasCompradas() {
//         localStorage.removeItem('butacasCompradas');
//         // También puedes reiniciar la apariencia de las butacas en la interfaz gráfica si es necesario
//         butacas.forEach(butaca => {
//             butaca.classList.remove('comprada');
//             butaca.addEventListener('click', toggleButaca);
//         });
//     }
//     reiniciarButacasCompradas()
});
