import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "navigation": {
                "features": "Features",
                "pricing": "Pricing",
                "documentation": "Documentation",
                "blog": "Blog",
                "aiScheduler": "AI Scheduler (Demo App)",
                "fileUpload": "File Upload (AWS S3)"
            },
            "hero": {
                "title": "Some cool words about your product",
                "subtitle": "With some more exciting words about your product!",
                "cta": "Get Started"
            },
            "features": {
                "title": "The Best Features",
                "subtitle": "Don't work harder.\nWork smarter.",
                "feature1": {
                    "name": "Cool Feature #1",
                    "description": "Describe your cool feature here."
                },
                "feature2": {
                    "name": "Cool Feature #2",
                    "description": "Describe your cool feature here."
                },
                "feature3": {
                    "name": "Cool Feature #3",
                    "description": "Describe your cool feature here."
                },
                "feature4": {
                    "name": "Cool Feature #4",
                    "description": "Describe your cool feature here."
                }
            },
            "clients": {
                "title": "Built with / Used by:"
            },
            "testimonials": {
                "title": "What Our Users Say",
                "daBoi": {
                    "name": "Da Boi",
                    "role": "Wasp Mascot",
                    "quote": "I don't even know how to code. I'm just a plushie."
                },
                "mrFoobar": {
                    "name": "Mr. Foobar",
                    "role": "Founder @ Cool Startup",
                    "quote": "This product makes me cooler than I already am."
                },
                "jamie": {
                    "name": "Jamie",
                    "role": "Happy Customer",
                    "quote": "My cats love it!"
                }
            },
            "faqs": {
                "title": "Frequently asked questions",
                "question1": {
                    "question": "What's the meaning of life?",
                    "answer": "42."
                }
            },
            "footer": {
                "app": {
                    "documentation": "Documentation",
                    "blog": "Blog"
                },
                "company": {
                    "about": "About",
                    "privacy": "Privacy",
                    "terms": "Terms of Service"
                }
            },
            "common": {
                "learnMore": "Learn more"
            },
            "fileUpload": {
                "title": "File Upload",
                "subtitle": "This is an example file upload page using AWS S3. Maybe your app needs this. Maybe it doesn't. But a lot of people asked for this feature, so here you go 🤝",
                "uploadButton": "Upload",
                "uploadedFiles": "Uploaded Files",
                "loading": "Loading...",
                "noFiles": "No files uploaded yet :(",
                "downloadButton": "Download",
                "errors": {
                    "uploadError": {
                        "noFile": "Please select a file to upload",
                        "uploadFailed": "Failed to upload file. Please try again",
                        "s3Failed": "File upload to storage failed. Please try again",
                        "generic": "An error occurred while uploading. Please try again"
                    },
                    "downloadError": {
                        "fetchFailed": "Unable to generate download link. Please try again",
                        "generic": "An error occurred while downloading. Please try again"
                    }
                }
            },
            "aiScheduler": {
                "title": "Day Scheduler",
                "description": "This example app uses OpenAI's chat completions with function calling to return a structured JSON object. Try it out, enter your day's tasks, and let AI do the rest!",
                "form": {
                    "taskPlaceholder": "Enter task description",
                    "addTaskButton": "Add Task",
                    "hoursLabel": "How many hours will you work today?",
                    "noTasks": "Add tasks to begin",
                    "generateButton": "Generate Schedule",
                    "generatingButton": "Generating...",
                    "scheduleTitle": "Today's Schedule",
                    "loading": "Loading...",
                    "errors": {
                        "generic": "Error: Something went wrong",
                        "createTask": "Error creating task"
                    },
                    "time": {
                        "hours": "hrs",
                        "minutes": "min",
                        "hour": "hr"
                    },
                    "priority": {
                        "high": "high priority",
                        "medium": "medium priority",
                        "low": "low priority"
                    },
                    "removeTask": "Remove task",
                    "checkbox": {
                        "ariaLabel": "Mark task as done"
                    }
                },
                "task": {
                    "hours": "hrs",
                    "removeTask": "Remove task"
                },
                "schedule": {
                    "priority": {
                        "high": "high priority",
                        "medium": "medium priority",
                        "low": "low priority"
                    },
                    "noMainTasks": "OpenAI didn't return any Main Tasks. Try again.",
                    "noSubtasks": "OpenAI didn't return any Subtasks. Try again."
                },
                "todo": {
                    "removeTaskTitle": "Remove task",
                    "time": {
                        "hours": "hrs",
                        "minutes": "min",
                        "hour": "hr"
                    },
                    "checkbox": {
                        "ariaLabel": "Mark task as done"
                    }
                },
                "taskTable": {
                    "noMainTasks": "OpenAI didn't return any Main Tasks. Try again.",
                    "noSubtasks": "OpenAI didn't return any Subtasks. Try again.",
                    "priority": {
                        "high": "high priority",
                        "medium": "medium priority",
                        "low": "low priority"
                    },
                    "timeFormats": {
                        "1hr": "1hr",
                        "30min": "30min",
                        "18min": "18min",
                        "12min": "12min",
                        "1hr30min": "1hr 30min"
                    }
                },
                "defaultTasks": {
                    "email": {
                        "name": "Respond to emails",
                        "priority": "high priority",
                        "subtasks": {
                            "check": {
                                "description": "Check and respond to important emails",
                                "time": "1hr"
                            },
                            "organize": {
                                "description": "Organize and prioritize remaining emails",
                                "time": "30min"
                            },
                            "draft": {
                                "description": "Draft responses to urgent emails",
                                "time": "30min"
                            }
                        }
                    },
                    "book": {
                        "name": "Read a book",
                        "priority": "medium priority",
                        "subtasks": {
                            "intro": {
                                "description": "Read introduction and chapter 1",
                                "time": "30min"
                            },
                            "chapter2": {
                                "description": "Read chapter 2 and take notes",
                                "time": "18min"
                            },
                            "chapter3": {
                                "description": "Read chapter 3 and summarize key points",
                                "time": "12min"
                            }
                        }
                    },
                    "wasp": {
                        "name": "Learn WASP",
                        "priority": "low priority",
                        "subtasks": {
                            "watch": {
                                "description": "Watch tutorial video on WASP",
                                "time": "30min"
                            },
                            "quiz": {
                                "description": "Complete online quiz on the basics of WASP",
                                "time": "1hr 30min"
                            },
                            "review": {
                                "description": "Review quiz answers and clarify doubts",
                                "time": "1hr"
                            }
                        }
                    }
                },
                "timeFormat": {
                    "hour": "hr",
                    "hours": "hrs",
                    "minute": "min",
                    "minutes": "min",
                    "shortHour": "hr",
                    "shortMinute": "min",
                    "timeDisplay": "{{hours}}hr {{minutes}}min",
                    "hourOnly": "{{hours}}hr",
                    "minuteOnly": "{{minutes}}min"
                }
            },
            "pricing": {
                "title": "Pick your pricing",
                "subtitle": "Choose between Stripe and LemonSqueezy as your payment provider. Just add your Product IDs! Try it out below with test credit card number",
                "testCard": "4242 4242 4242 4242 4242",
                "plans": {
                    "hobby": {
                        "name": "Hobby",
                        "price": "$9.99",
                        "description": "All you need to get started",
                        "features": [
                            "Limited monthly usage",
                            "Basic support"
                        ]
                    },
                    "pro": {
                        "name": "Pro",
                        "price": "$19.99",
                        "description": "Our most popular plan",
                        "features": [
                            "Unlimited monthly usage",
                            "Priority customer support"
                        ]
                    },
                    "credits10": {
                        "name": "10 Credits",
                        "price": "$9.99",
                        "description": "One-time purchase of 10 credits for your account",
                        "features": [
                            "Use credits for e.g. OpenAI API calls",
                            "No expiration date"
                        ]
                    }
                },
                "buttons": {
                    "manageSubscription": "Manage Subscription",
                    "buyPlan": "Buy plan",
                    "loginToBuy": "Log in to buy plan"
                },
                "perMonth": "/month"
            },
            "account": {
                "title": "Account Information",
                "email": "Email address",
                "username": "Username",
                "plan": "Your Plan",
                "about": "About",
                "aboutText": "I'm a cool customer.",
                "logout": "logout",
                "subscription": {
                    "credits": "Credits remaining: {{credits}}",
                    "buyMore": "Buy More/Upgrade",
                    "manageSubscription": "Manage Subscription",
                    "status": {
                        "active": "{{planName}}",
                        "past_due": "Payment for your {{planName}} plan is past due! Please update your subscription payment information.",
                        "cancel_at_period_end": "Your {{planName}} plan subscription has been canceled, but remains active until the end of the current billing period: {{date}}",
                        "deleted": "Your previous subscription has been canceled and is no longer active."
                    },
                    "errors": {
                        "portalUrl": "Error fetching customer portal url",
                        "portalNotAvailable": "Customer portal URL is not available"
                    }
                }
            },
            "userMenu": {
                "aiScheduler": "AI Scheduler (Demo App)",
                "accountSettings": "Account Settings",
                "adminDashboard": "Admin Dashboard",
                "logout": "Log Out"
            }
        }
    },
    es: {
        translation: {
            "navigation": {
                "features": "Características",
                "pricing": "Precios",
                "documentation": "Documentación",
                "blog": "Blog",
                "aiScheduler": "Planificador IA (App Demo)",
                "fileUpload": "Subida de Archivos"
            },
            "hero": {
                "title": "Algunas palabras geniales sobre tu producto",
                "subtitle": "¡Con más palabras emocionantes sobre tu producto!",
                "cta": "Comenzar"
            },
            "features": {
                "title": "Las Mejores Características",
                "subtitle": "No trabajes más duro.\nTrabaja más inteligente.",
                "feature1": {
                    "name": "Función Genial #1",
                    "description": "Describe tu función genial aquí."
                },
                "feature2": {
                    "name": "Función Genial #2",
                    "description": "Describe tu función genial aquí."
                },
                "feature3": {
                    "name": "Función Genial #3",
                    "description": "Describe tu función genial aquí."
                },
                "feature4": {
                    "name": "Función Genial #4",
                    "description": "Describe tu función genial aquí."
                }
            },
            "clients": {
                "title": "Construido con / Usado por:"
            },
            "testimonials": {
                "title": "Lo que dicen nuestros usuarios",
                "daBoi": {
                    "name": "Da Boi",
                    "role": "Mascota de Wasp",
                    "quote": "Ni siquiera sé programar. Solo soy un peluche."
                },
                "mrFoobar": {
                    "name": "Sr. Foobar",
                    "role": "Fundador @ Startup Genial",
                    "quote": "Este producto me hace más genial de lo que ya soy."
                },
                "jamie": {
                    "name": "Jamie",
                    "role": "Cliente Satisfecho",
                    "quote": "¡A mis gatos les encanta!"
                }
            },
            "faqs": {
                "title": "Preguntas frecuentes",
                "question1": {
                    "question": "¿Cuál es el sentido de la vida?",
                    "answer": "42."
                }
            },
            "footer": {
                "app": {
                    "documentation": "Documentación",
                    "blog": "Blog"
                },
                "company": {
                    "about": "Acerca de",
                    "privacy": "Privacidad",
                    "terms": "Términos de Servicio"
                }
            },
            "common": {
                "learnMore": "Saber más"
            },
            "fileUpload": {
                "title": "Subida de Archivos",
                "subtitle": "Esta es una página de ejemplo para subir archivos usando AWS S3. Tal vez tu aplicación lo necesite. Tal vez no. Pero mucha gente pidió esta función, así que aquí la tienes 🤝",
                "uploadButton": "Subir",
                "uploadedFiles": "Archivos Subidos",
                "loading": "Cargando...",
                "noFiles": "Aún no hay archivos subidos :(",
                "downloadButton": "Descargar",
                "errors": {
                    "uploadError": {
                        "noFile": "Por favor, selecciona un archivo para subir",
                        "uploadFailed": "Error al subir el archivo. Por favor, inténtalo de nuevo",
                        "s3Failed": "Error al subir el archivo al almacenamiento. Por favor, inténtalo de nuevo",
                        "generic": "Ocurrió un error durante la subida. Por favor, inténtalo de nuevo"
                    },
                    "downloadError": {
                        "fetchFailed": "No se pudo generar el enlace de descarga. Por favor, inténtalo de nuevo",
                        "generic": "Ocurrió un error durante la descarga. Por favor, inténtalo de nuevo"
                    }
                }
            },
            "aiScheduler": {
                "title": "Planificador Diario",
                "description": "Esta aplicación de ejemplo utiliza las completaciones de chat de OpenAI con llamadas a funciones para devolver un objeto JSON estructurado. ¡Pruébalo, ingresa tus tareas del día y deja que la IA haga el resto!",
                "form": {
                    "taskPlaceholder": "Ingresa la descripción de la tarea",
                    "addTaskButton": "Agregar Tarea",
                    "hoursLabel": "¿Cuántas horas trabajarás hoy?",
                    "noTasks": "Agrega tareas para comenzar",
                    "generateButton": "Generar Horario",
                    "generatingButton": "Generando...",
                    "scheduleTitle": "Horario de Hoy",
                    "loading": "Cargando...",
                    "errors": {
                        "generic": "Error: Algo salió mal",
                        "createTask": "Error al crear la tarea"
                    },
                    "time": {
                        "hours": "hrs",
                        "minutes": "min",
                        "hour": "hr"
                    },
                    "priority": {
                        "high": "prioridad alta",
                        "medium": "prioridad media",
                        "low": "prioridad baja"
                    },
                    "removeTask": "Eliminar tarea",
                    "checkbox": {
                        "ariaLabel": "Marcar tarea como completada"
                    }
                },
                "task": {
                    "hours": "hrs",
                    "removeTask": "Eliminar tarea"
                },
                "schedule": {
                    "priority": {
                        "high": "prioridad alta",
                        "medium": "prioridad media",
                        "low": "prioridad baja"
                    },
                    "noMainTasks": "OpenAI no devolvió ninguna Tarea Principal. Inténtalo de nuevo.",
                    "noSubtasks": "OpenAI no devolvió ninguna Subtarea. Inténtalo de nuevo."
                },
                "todo": {
                    "removeTaskTitle": "Eliminar tarea",
                    "time": {
                        "hours": "hrs",
                        "minutes": "min",
                        "hour": "hr"
                    },
                    "checkbox": {
                        "ariaLabel": "Marcar tarea como completada"
                    }
                },
                "taskTable": {
                    "noMainTasks": "OpenAI no devolvió ninguna Tarea Principal. Inténtalo de nuevo.",
                    "noSubtasks": "OpenAI no devolvió ninguna Subtarea. Inténtalo de nuevo.",
                    "priority": {
                        "high": "prioridad alta",
                        "medium": "prioridad media",
                        "low": "prioridad baja"
                    },
                    "timeFormats": {
                        "1hr": "1h",
                        "30min": "30min",
                        "18min": "18min",
                        "12min": "12min",
                        "1hr30min": "1h 30min"
                    }
                },
                "defaultTasks": {
                    "email": {
                        "name": "Responder correos",
                        "priority": "prioridad alta",
                        "subtasks": {
                            "check": {
                                "description": "Revisar y responder correos importantes",
                                "time": "1h"
                            },
                            "organize": {
                                "description": "Organizar y priorizar correos restantes",
                                "time": "30min"
                            },
                            "draft": {
                                "description": "Redactar respuestas a correos urgentes",
                                "time": "30min"
                            }
                        }
                    },
                    "book": {
                        "name": "Leer un libro",
                        "priority": "prioridad media",
                        "subtasks": {
                            "intro": {
                                "description": "Leer introducción y capítulo 1",
                                "time": "30min"
                            },
                            "chapter2": {
                                "description": "Leer capítulo 2 y tomar notas",
                                "time": "18min"
                            },
                            "chapter3": {
                                "description": "Leer capítulo 3 y resumir puntos clave",
                                "time": "12min"
                            }
                        }
                    },
                    "wasp": {
                        "name": "Aprender WASP",
                        "priority": "prioridad baja",
                        "subtasks": {
                            "watch": {
                                "description": "Ver video tutorial sobre WASP",
                                "time": "30min"
                            },
                            "quiz": {
                                "description": "Completar cuestionario en línea sobre conceptos básicos de WASP",
                                "time": "1h 30min"
                            },
                            "review": {
                                "description": "Revisar respuestas del cuestionario y aclarar dudas",
                                "time": "1h"
                            }
                        }
                    }
                },
                "timeFormat": {
                    "hour": "hora",
                    "hours": "horas",
                    "minute": "min",
                    "minutes": "min",
                    "shortHour": "h",
                    "shortMinute": "min",
                    "timeDisplay": "{{hours}}h {{minutes}}min",
                    "hourOnly": "{{hours}}h",
                    "minuteOnly": "{{minutes}}min"
                }
            },
            "pricing": {
                "title": "Elige tu precio",
                "subtitle": "Elige entre Stripe y LemonSqueezy como tu proveedor de pagos. ¡Solo agrega tus ID de Producto! Pruébalo a continuación con el número de tarjeta de crédito de prueba",
                "testCard": "4242 4242 4242 4242 4242",
                "plans": {
                    "hobby": {
                        "name": "Hobby",
                        "price": "$9.99",
                        "description": "Todo lo que necesitas para comenzar",
                        "features": [
                            "Uso mensual limitado",
                            "Soporte básico"
                        ]
                    },
                    "pro": {
                        "name": "Pro",
                        "price": "$19.99",
                        "description": "Nuestro plan más popular",
                        "features": [
                            "Uso mensual ilimitado",
                            "Soporte prioritario al cliente"
                        ]
                    },
                    "credits10": {
                        "name": "10 Créditos",
                        "price": "$9.99",
                        "description": "Compra única de 10 créditos para tu cuenta",
                        "features": [
                            "Usa créditos para llamadas a la API de OpenAI",
                            "Sin fecha de vencimiento"
                        ]
                    }
                },
                "buttons": {
                    "manageSubscription": "Gestionar Suscripción",
                    "buyPlan": "Comprar plan",
                    "loginToBuy": "Inicia sesión para comprar"
                },
                "perMonth": "/mes"
            },
            "account": {
                "title": "Información de la Cuenta",
                "email": "Correo electrónico",
                "username": "Nombre de usuario",
                "plan": "Tu Plan",
                "about": "Acerca de",
                "aboutText": "Soy un cliente genial.",
                "logout": "cerrar sesión",
                "subscription": {
                    "credits": "Créditos restantes: {{credits}}",
                    "buyMore": "Comprar Más/Mejorar",
                    "manageSubscription": "Gestionar Suscripción",
                    "status": {
                        "active": "{{planName}}",
                        "past_due": "¡El pago de tu plan {{planName}} está vencido! Por favor, actualiza tu información de pago de suscripción.",
                        "cancel_at_period_end": "Tu suscripción al plan {{planName}} ha sido cancelada, pero permanece activa hasta el final del período de facturación actual: {{date}}",
                        "deleted": "Tu suscripción anterior ha sido cancelada y ya no está activa."
                    },
                    "errors": {
                        "portalUrl": "Error al obtener la URL del portal del cliente",
                        "portalNotAvailable": "La URL del portal del cliente no está disponible"
                    }
                }
            },
            "userMenu": {
                "aiScheduler": "Planificador IA (App Demo)",
                "accountSettings": "Ajustes de Cuenta",
                "adminDashboard": "Panel de Administrador",
                "logout": "Cerrar Sesión"
            }
        }
    }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    debug: true,
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
      cookieMinutes: 160,
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('initialized', (options) => {
  console.log('i18n initialized:', options);
});

i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
});

export default i18n; 