import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "API REST SEL",
      version: '1.0.0',
      description: "API du Système d'Échange Local",
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Auth', description: 'Authentification' },
      { name: 'Catégories', description: 'Gestion des catégories' },
      { name: 'Compétences', description: 'Gestion des compétences' },
      { name: 'Membres', description: 'Gestion des membres' },
      { name: 'Cotisations', description: 'Cotisations des membres' },
      { name: 'Propositions', description: 'Propositions de service' },
      { name: 'Transactions', description: 'Échanges de services' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Token retourné par POST /api/auth/login',
        },
      },
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Informatique' },
          },
        },
        Competence: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Développement web' },
            id_categorie: { type: 'integer', example: 1 },
          },
        },
        Member: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Dupont' },
            prenom: { type: 'string', example: 'Jean' },
            adresse: { type: 'string', example: '1 rue de la Paix' },
            date_de_naissance: { type: 'string', format: 'date', example: '1990-01-15' },
            adresse_mail: { type: 'string', format: 'email', example: 'jean.dupont@mail.com' },
            num_tel: { type: 'integer', example: 612345678 },
            espace_de_donnees: { type: 'string', nullable: true },
            profil: { type: 'string', enum: ['admin', 'utilisateur'] },
          },
        },
        Cotisation: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            code_membre: { type: 'integer', example: 1 },
            annee: { type: 'integer', example: 2024 },
            prix: { type: 'number', example: 25.0 },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
          },
        },
        Proposition: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            membre_competence: { type: 'integer', example: 1 },
            date_debut: { type: 'string', format: 'date', example: '2024-02-01' },
            date_fin: { type: 'string', format: 'date', example: '2024-02-28' },
            description: { type: 'string', example: 'Cours de guitare' },
            tarif: { type: 'integer', example: 20 },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            acteur: { type: 'integer', example: 2 },
            beneficiaire: { type: 'integer', example: 3 },
            proposition: { type: 'integer', nullable: true, example: 1 },
            duree_theorique: { type: 'integer', example: 2 },
            date_prevu: { type: 'string', format: 'date', example: '2024-02-15' },
            etat: { type: 'string', enum: ['prevu', 'en_cours', 'terminee'] },
            nb_heures: { type: 'integer', nullable: true, example: 2 },
            date_real: { type: 'string', format: 'date', nullable: true, example: '2024-02-15' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Données invalides' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
