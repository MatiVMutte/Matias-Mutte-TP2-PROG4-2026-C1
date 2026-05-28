import { Component } from '@angular/core';

interface UltimaPublicacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  likes: number;
  comentarios: { autor: string; texto: string; fecha: string }[];
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  readonly usuario = {
    nombre: 'Juan',
    apellido: 'Pérez',
    username: 'juanperez',
    correo: 'juan.perez@utn.edu.ar',
    fechaNacimiento: '15/03/2000',
    descripcion: 'Estudiante de Ingeniería en Sistemas. Apasionado por el desarrollo web y la tecnología.',
    perfil: 'usuario',
    avatar: '',
  };

  readonly ultimasPublicaciones: UltimaPublicacion[] = [
    {
      id: 1,
      titulo: 'Apuntes de Programación IV',
      mensaje: 'Comparto mis apuntes del módulo de Angular. Espero les sean útiles para el parcial.',
      fecha: 'hace 3 días',
      likes: 15,
      comentarios: [
        { autor: 'María G.', texto: '¡Gracias, muy claros!', fecha: 'hace 2 días' },
        { autor: 'Carlos R.', texto: 'Justo lo que necesitaba', fecha: 'hace 1 día' },
      ],
    },
    {
      id: 2,
      titulo: 'Consulta sobre Redes',
      mensaje: '¿Alguien me puede explicar la diferencia entre TCP y UDP de forma simple?',
      fecha: 'hace 1 semana',
      likes: 4,
      comentarios: [
        { autor: 'Laura M.', texto: 'TCP garantiza entrega, UDP no pero es más rápido.', fecha: 'hace 6 días' },
      ],
    },
    {
      id: 3,
      titulo: 'Proyecto integrador terminado',
      mensaje: '¡Por fin terminamos el proyecto integrador del cuatrimestre! Fue un gran trabajo en equipo.',
      fecha: 'hace 2 semanas',
      likes: 32,
      comentarios: [],
    },
  ];

  getInitials(): string {
    return (this.usuario.nombre[0] + this.usuario.apellido[0]).toUpperCase();
  }
}
