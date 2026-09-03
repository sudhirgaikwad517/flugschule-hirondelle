import { prisma } from './src/utils/prisma';

const unlayerDesign = {
  "body": {
    "rows": [
      // Blue bar with bird logo
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "image",
                "values": {
                  "src": {
                    "url": "https://www.fs-hirondelle.de/images/logo_bird_white.png",
                    "width": 50,
                    "height": "auto"
                  },
                  "padding": "10px",
                  "containerPadding": "0px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#3d8ebb",
              "padding": "0px"
            }
          }
        ],
        "values": {
          "backgroundColor": "#3d8ebb",
          "padding": "0px",
          "columnsBackgroundColor": "#3d8ebb"
        }
      },
      // Grey NEWSLETTER banner
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "heading",
                "values": {
                  "headingType": "h2",
                  "text": "✉ NEWSLETTER",
                  "color": "#3d8ebb",
                  "textAlign": "left",
                  "padding": "20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#f4f4f4"
            }
          }
        ],
        "values": {
          "backgroundColor": "#f4f4f4"
        }
      },
      // White logo section
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "image",
                "values": {
                  "src": {
                    "url": "https://www.fs-hirondelle.de/images/logo_hirondelle.png"
                  },
                  "textAlign": "left",
                  "padding": "20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      // Greeting + Weinheim opening hours
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"font-size: 18px; color: #3d8ebb; font-weight: bold;\">Hallo {subtag:name|part:first|ucfirst},</p><p style=\"font-size: 16px; margin-top: 15px;\">am Mittwoch, 7.8.24 sind wir wieder von 16 - 19 Uhr für euch in der Flugschule in Weinheim. Wer was braucht oder quatschen will, schaut gerne vorbei. <strong>Meldet euch bitte vorab bei uns per E-Mail mit eurer Wunschuhrzeit an</strong>, damit wir das ein bissel koordinieren können und nicht alle auf einmal dastehen :-).</p>",
                  "padding": "20px",
                  "color": "#333333"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      // Parking note + Advance Lightness intro + image
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"font-size: 16px; font-style: italic;\">Bitte in den umliegenden Straßen parken, die Parkplätze im Hof der Flugschule sind den Anwohnern vorbehalten!</p><hr style=\"border: none; border-top: 1px solid #ccc; margin: 15px 0;\"/><p style=\"font-size: 18px; color: #333333; font-weight: bold;\">Advance Lightness endlich bei uns eingetroffen.</p><p style=\"font-size: 16px; margin-top: 10px;\">Wir haben lange auf den Nachfolger des Lightness 3 Liegegurtzeuges von Advance gewartet - nun ist es endlich da.</p>",
                  "padding": "20px",
                  "color": "#333333"
                }
              },
              {
                "type": "image",
                "values": {
                  "src": {
                    "url": "http://localhost:5556/uploads/lightness-advance.png",
                    "width": 560,
                    "height": "auto"
                  },
                  "textAlign": "center",
                  "padding": "0px 20px 20px 20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      // Lightness 4 details + Theorieschulung section
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"font-size: 16px;\">Das Lightness 4 überzeugt durch viele kleine, gut durchdachte Details. Die ersten zwei Gurte sind schon draußen unterwegs und wir sind schon sehr gespannt auf das Feedback :-)!</p><p style=\"font-size: 16px; margin-top: 10px;\">Bei interesse gerne melden.</p><hr style=\"border: none; border-top: 1px solid #ccc; margin: 15px 0;\"/><p style=\"font-size: 18px; color: #333333; font-weight: bold;\">Theorieschulung - Grundkurs und A-Schein</p><p style=\"font-size: 16px; margin-top: 10px;\">Morgen am Mittwoch findet die Theorie für Grundkurs und Freitag bzw. Samstag A-Theorie statt. Der Kurs vermittelt euch die notwendigen Grundlagen fürs Fliegen und ist verpflichtend für alle, die zur Höhenflugschulung mit wollen. Der Kurs findet online statt, also ganz bequem von zu Hause aus! Jeder, der aktuell im Grundkurs ist, kann und sollte also daran teilnehmen :-) Hier geht's zur Anmeldung:</p><ul style=\"font-size: 16px; padding-left: 20px; margin-top: 10px;\"><li style=\"margin-bottom: 8px;\"><strong>GK-Theorie</strong> Mittwoch, 7.8.24 18-21 Uhr online: <a href=\"https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/11-grundkurs/1261-gk-th\" style=\"color: #3d8ebb;\">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/11-grundkurs/1261-gk-th</a></li><li><strong>A-Theorie</strong> 9./10.8.24 Freitag Abend und Samstag ganztägig online: <a href=\"https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/12-hoehenflugschulung/1265-a-theorie\" style=\"color: #3d8ebb;\">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/12-hoehenflugschulung/1265-a-theorie</a></li></ul>",
                  "padding": "20px",
                  "color": "#333333"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      // Reisen/Trainings list + closing + signature
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"font-size: 16px;\">Und hier gibt's noch weitere freie Plätze bei unseren Reisen und Trainings:</p><ul style=\"font-size: 16px; padding-left: 20px; margin-top: 10px;\"><li style=\"margin-bottom: 8px;\">Sicherheitstraining am Gardasee 1.9. - 6.9.2024 <a href=\"https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/15-performance-training/1284-sicherheitstraining\" style=\"color: #3d8ebb;\">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/15-performance-training/1284-sicherheitstraining</a></li><li>Südafrika-Safari 11.-25.1.2025 <a href=\"https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/14-reisen/1286-s%C3%BCdafrika-tour\" style=\"color: #3d8ebb;\">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/14-reisen/1286-südafrika-tour</a></li></ul><p style=\"font-size: 16px; margin-top: 15px;\">…mehr Infos rund ums's Gleitschirmfliegen, zu unseren Kursen und Reisen findet ihr auf unserer Website <a href=\"https://www.fs-hirondelle.de\" style=\"color: #3d8ebb;\">www.fs-hirondelle.de</a> sowie in unserem <a href=\"#\" style=\"color: #3d8ebb;\">YouTube-Kanal</a> - schaut einfach mal rein!</p><p style=\"font-size: 16px; color: #3d8ebb; font-style: italic; font-weight: bold; margin-top: 20px;\">Luftige Grüße<br>Team Hirondelle</p>",
                  "padding": "20px",
                  "color": "#333333"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      // Footer: address / bank / privacy
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "divider",
                "values": {
                  "width": "100%",
                  "border": {
                    "borderTopWidth": "1px",
                    "borderTopStyle": "solid",
                    "borderTopColor": "#cccccc"
                  }
                }
              },
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"text-align: center; font-size: 12px; font-weight: bold;\">Flugschule Hirondelle<br>Untergasse 27 - 69469 Weinheim | Am Birnbach 6 - 76829 Landau<br><br>Telefon: +49 (0) 6201 8452097<br><br><span style=\"color: #3d8ebb; font-size: 14px;\">Sparkasse SÜW<br>IBAN: DE32 5485 0010 1700 1976 41<br>BIC: SOLADES1SUW</span><br><br><a href=\"#\" style=\"color: #3d8ebb;\">Datenschutzerklärung</a><br><br>Bitte tragen Sie uns in Ihr Adressbuch ein,<br>um einen einwandfreien Empfang zu ermöglichen.</p>",
                  "padding": "20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      // Unsubscribe bar
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"text-align: center; color: white;\">Kein Interesse mehr am Newsletter? {unsubscribe}Abmelden{/unsubscribe}</p>",
                  "padding": "15px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#3d8ebb"
            }
          }
        ],
        "values": {
          "backgroundColor": "#3d8ebb"
        }
      }
    ],
    "values": {
      "backgroundColor": "#e6e6e6",
      "fontFamily": {
        "label": "Arial",
        "value": "arial,helvetica,sans-serif"
      }
    }
  }
};

const htmlContent = `
<div style="background-color: #e6e6e6; font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #3d8ebb; padding: 10px; text-align: center;">
      <img src="https://www.fs-hirondelle.de/images/logo_bird_white.png" width="50" alt="Bird Logo" />
    </div>
    <div style="background-color: #f4f4f4; padding: 20px; color: #3d8ebb; font-size: 24px; font-weight: bold;">
      ✉ NEWSLETTER
    </div>
    <div style="padding: 20px;">
      <img src="https://www.fs-hirondelle.de/images/logo_hirondelle.png" alt="Flugschule Hirondelle Logo" style="max-width: 100%;" />
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 18px; color: #3d8ebb; font-weight: bold;">Hallo {subtag:name|part:first|ucfirst},</p>
      <p style="font-size: 16px;">am Mittwoch, 7.8.24 sind wir wieder von 16 - 19 Uhr für euch in der Flugschule in Weinheim. Wer was braucht oder quatschen will, schaut gerne vorbei. <strong>Meldet euch bitte vorab bei uns per E-Mail mit eurer Wunschuhrzeit an</strong>, damit wir das ein bissel koordinieren können und nicht alle auf einmal dastehen :-).</p>
    </div>
    <div style="padding: 0 20px 20px 20px;">
      <p style="font-size: 16px; font-style: italic;">Bitte in den umliegenden Straßen parken, die Parkplätze im Hof der Flugschule sind den Anwohnern vorbehalten!</p>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 15px 0;" />
      <p style="font-size: 18px; font-weight: bold;">Advance Lightness endlich bei uns eingetroffen.</p>
      <p style="font-size: 16px;">Wir haben lange auf den Nachfolger des Lightness 3 Liegegurtzeuges von Advance gewartet - nun ist es endlich da.</p>
      <img src="http://localhost:5556/uploads/lightness-advance.png" style="max-width: 100%; margin-top: 10px;" alt="Advance Lightness 4" />
    </div>
    <div style="padding: 0 20px 20px 20px;">
      <p style="font-size: 16px;">Das Lightness 4 überzeugt durch viele kleine, gut durchdachte Details. Die ersten zwei Gurte sind schon draußen unterwegs und wir sind schon sehr gespannt auf das Feedback :-)!</p>
      <p style="font-size: 16px;">Bei interesse gerne melden.</p>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 15px 0;" />
      <p style="font-size: 18px; font-weight: bold;">Theorieschulung - Grundkurs und A-Schein</p>
      <p style="font-size: 16px;">Morgen am Mittwoch findet die Theorie für Grundkurs und Freitag bzw. Samstag A-Theorie statt. Der Kurs vermittelt euch die notwendigen Grundlagen fürs Fliegen und ist verpflichtend für alle, die zur Höhenflugschulung mit wollen. Der Kurs findet online statt, also ganz bequem von zu Hause aus! Jeder, der aktuell im Grundkurs ist, kann und sollte also daran teilnehmen :-) Hier geht's zur Anmeldung:</p>
      <ul style="font-size: 16px; padding-left: 20px;">
        <li><strong>GK-Theorie</strong> Mittwoch, 7.8.24 18-21 Uhr online: <a href="https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/11-grundkurs/1261-gk-th" style="color: #3d8ebb;">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/11-grundkurs/1261-gk-th</a></li>
        <li><strong>A-Theorie</strong> 9./10.8.24 Freitag Abend und Samstag ganztägig online: <a href="https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/12-hoehenflugschulung/1265-a-theorie" style="color: #3d8ebb;">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/12-hoehenflugschulung/1265-a-theorie</a></li>
      </ul>
    </div>
    <div style="padding: 0 20px 20px 20px;">
      <p style="font-size: 16px;">Und hier gibt's noch weitere freie Plätze bei unseren Reisen und Trainings:</p>
      <ul style="font-size: 16px; padding-left: 20px;">
        <li>Sicherheitstraining am Gardasee 1.9. - 6.9.2024 <a href="https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/15-performance-training/1284-sicherheitstraining" style="color: #3d8ebb;">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/15-performance-training/1284-sicherheitstraining</a></li>
        <li>Südafrika-Safari 11.-25.1.2025 <a href="https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/14-reisen/1286-s%C3%BCdafrika-tour" style="color: #3d8ebb;">https://www.fs-hirondelle.de/terminkalender/kalenderliste/event/14-reisen/1286-südafrika-tour</a></li>
      </ul>
      <p style="font-size: 16px;">…mehr Infos rund ums's Gleitschirmfliegen, zu unseren Kursen und Reisen findet ihr auf unserer Website <a href="https://www.fs-hirondelle.de" style="color: #3d8ebb;">www.fs-hirondelle.de</a> sowie in unserem <a href="#" style="color: #3d8ebb;">YouTube-Kanal</a> - schaut einfach mal rein!</p>
      <p style="font-size: 16px; color: #3d8ebb; font-style: italic; font-weight: bold;">Luftige Grüße<br>Team Hirondelle</p>
    </div>
    <hr style="border: none; border-top: 1px solid #ccc; margin: 0 20px;" />
    <div style="padding: 20px;">
      <p style="text-align: center; font-size: 12px; font-weight: bold;">
        Flugschule Hirondelle<br>
        Untergasse 27 - 69469 Weinheim | Am Birnbach 6 - 76829 Landau<br><br>
        Telefon: +49 (0) 6201 8452097<br><br>
        <span style="color: #3d8ebb; font-size: 14px;">Sparkasse SÜW<br>
        IBAN: DE32 5485 0010 1700 1976 41<br>
        BIC: SOLADES1SUW</span><br><br>
        <a href="#" style="color: #3d8ebb;">Datenschutzerklärung</a><br><br>
        Bitte tragen Sie uns in Ihr Adressbuch ein,<br>um einen einwandfreien Empfang zu ermöglichen.
      </p>
    </div>
    <div style="background-color: #3d8ebb; padding: 15px; text-align: center; color: white;">
      Kein Interesse mehr am Newsletter? {unsubscribe}Abmelden{/unsubscribe}
    </div>
  </div>
</div>
`;

async function main() {
  // The "Vorlagen" template editor (Templates.tsx) parses `body` as the Unlayer
  // design JSON, while the campaign editor (EditEmail.tsx) reads `design` as the
  // JSON. Store the same design JSON in both fields so the template opens
  // correctly from either screen. `htmlContent` is kept for reference/preview use.
  const designJson = JSON.stringify(unlayerDesign);
  const template = await prisma.newsletterTemplate.create({
    data: {
      name: "Newsletter August 2024 (Lightness & Theorieschulung)",
      body: designJson,
      design: designJson
    }
  });
  console.log("Template created:", template.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
