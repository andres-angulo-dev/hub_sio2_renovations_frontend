---
title: "Fixture test published false — doit ne jamais apparaître"
description: "Fichier fixture utilisé pour prouver que getAllArticles() filtre correctement les drafts."
date: "2026-04-15"
slug: "fixture-published-false"
published: false
---

# Contenu brouillon

Ce fichier existe uniquement pour le test d'intégration du filtre published: false.
Il ne doit jamais apparaître dans aucune sortie publique (getAllArticles, getLatestArticles, /api/latest, sitemap).

Si vous voyez ce contenu en production, FOUND-05 est cassé.
