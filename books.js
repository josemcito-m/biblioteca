// Sample book data
const sampleBooks = [
    {
        id: 1,
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        cover: "https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747581622/100-a%C3%B1os-soledad_al5klk.jpg", 
        category: "Novela",
        year: 1967,
        pages: 417,
        language: "Español",
        description: "Cien años de soledad es una novela del escritor colombiano Gabriel García Márquez, ganador del Premio Nobel de Literatura en 1982. Es considerada una obra maestra del realismo mágico y una de las más influyentes de la literatura hispanoamericana.",
        pdfUrl: "libros/Cien-Años-de-Soledad.pdf" 
    },
    {
        id: 2,
        title: "1984",
        author: "George Orwell",
        cover: "https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747581621/1984_rhbzww.jpg",
        category: "Novela distópica",
        year: 1949,
        pages: 328,
        language: "Español",
        description: "1984 es una novela distópica escrita por George Orwell. Ambientada en una sociedad totalitaria vigilada por el Gran Hermano, explora temas como la censura, el control social y la manipulación de la verdad.",
        pdfUrl: "libros/1984.pdf" 
    },
    {
        id: 3,
        title: "Drácula",
        author: "Bram Stoker",
        cover: "https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747581623/dracula_sybgtt.jpg", 
        category: "Novela de terror",
        year: 1897,
        pages: 418,
        language: "Español",
        description: "Drácula es una novela gótica escrita por Bram Stoker. Narra la historia del conde Drácula y su intento de trasladarse de Transilvania a Inglaterra, donde enfrenta a un grupo de personas decididas a detenerlo.",
        pdfUrl: "libros/Drácula.pdf" 
    },
    {
        id: 4,
        title: "El principito",
        author: "Antoine de Saint-Exupéry",
        cover: "https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747581621/principito_pfqhek.jpg", 
        category: "Novela corta / Fábula",
        year: 1943,
        pages: 96,
        language: "Español",
        description: "El principito es una obra poética y filosófica escrita por Antoine de Saint-Exupéry. A través de la historia de un pequeño príncipe que viaja por distintos planetas, explora temas como la amistad, el amor y el sentido de la vida.",
        pdfUrl: "libros/El-Principito.pdf" 
    },
    {
        id: 5,
        title: "El viejo y el mar",
        author: "Ernest Hemingway",
        cover: "https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747581626/el-viejo-y-el-mar_vaghoi.jpg", 
        category: "Novela",
        year: 1952,
        pages: 127,
        language: "Español",
        description: "El viejo y el mar es una novela corta de Ernest Hemingway. Relata la lucha épica de un viejo pescador cubano contra un gran pez marlín en alta mar, simbolizando la perseverancia y la dignidad ante la adversidad.",
        pdfUrl: "libros/El-Viejo-y-El-Mar.pdf" 
    },
    {
        id: 6,
        title: "La divina comedia",
        author: "Dante Alighieri",
        cover: "https://res.cloudinary.com/dlk4jsoqp/image/upload/v1747581620/divina-comedia_ekmfmi.jpg", 
        category: "Poema épico",
        year: 1320,
        pages: 432,
        language: "Español",
        description: "La divina comedia es un poema épico escrito por Dante Alighieri. Describe el viaje alegórico de Dante a través del Infierno, el Purgatorio y el Paraíso, guiado por Virgilio y Beatriz, simbolizando la redención y la búsqueda espiritual.",
        pdfUrl: "libros/La-Divina-Comedia.pdf" 
    }
];

if (!localStorage.getItem('books')) {
    localStorage.setItem('books', JSON.stringify(sampleBooks));
}

function getBooks() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books));
}