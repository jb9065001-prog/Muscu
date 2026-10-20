(function(){
"use strict";

/* ---------- Calendrier (numérotation de la V6.2 : S3 = lundi 19 octobre 2026) ---------- */
var BUILD=14, BUILD_DATE="19 oct. 2026";
var FIRST=3, LAST=21, HFIRST=-36; /* HFIRST : semaine du 19 janv. 2026 ; les semaines avant S3 = ton historique, visible dans les graphiques */
var MONTHS=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
function dOf(n,off){return new Date(2026,9,19+(n-3)*7+(off||0));}
function fmtD(d){return d.getDate()+" "+MONTHS[d.getMonth()];}
function wLab(n){return n<0?fmtD(dOf(n,0)):"S"+n;}
function wDate(dm){var a=dm.split("/"),d=Date.UTC(2026,+a[1]-1,+a[0]),base=Date.UTC(2026,9,19);return 3+Math.floor((d-base)/864e5/7);}
function weekRange(n){return fmtD(dOf(n,0))+" – "+fmtD(dOf(n,6));}
function todayWeek(){var t=new Date();var t0=new Date(t.getFullYear(),t.getMonth(),t.getDate());var d=Math.round((t0-dOf(3,0))/864e5);return Math.max(FIRST,3+Math.floor(d/7));}
var PKEY={0:"hist",1:"hist",2:"hist",3:"calib",4:"b1",5:"b1",6:"b1",7:"b1end",8:"exam",9:"b2",10:"b2",11:"taper",12:"vac",13:"vac",14:"vac",15:"reprise",16:"b3",17:"b3",18:"b3",19:"b3",20:"exam",21:"test"};
var PH={
  hist:{chip:"Avant",short:"Avant",name:"Avant le carnet V6.2",rir:"RIR 1-2",fin:0,cardio:0,acc:false,txt:"Séances d'avant le 19 octobre, reprises de ton carnet papier."},
  calib:{chip:"Calibrage",short:"Calib.",name:"Calibrage",rir:"RIR 2",fin:8,cardio:35,acc:false,
    txt:"Nouvelles charges : toutes les séries à RIR 2. Tu cherches la bonne charge pour chaque exercice, pas le record."},
  b1:{chip:"Bloc 1",short:"Bloc 1",name:"Bloc 1",rir:"RIR 1-2",fin:10,cardio:40,acc:true,
    txt:"Règle de la 1re série : dès qu’elle atteint le haut de la fourchette avec au moins 1 rep en réserve, tu montes à la séance suivante. Isolation à RIR 0-1."},
  b1end:{chip:"Fin de bloc",short:"Fin B1",name:"Fin du bloc 1",rir:"RIR 1-2",fin:10,cardio:40,acc:true,
    txt:"Dernière semaine du bloc : RIR 1 sur les exercices principaux (tractions, développé au sol, fentes, step-ups). Le reste comme d’habitude."},
  exam:{chip:"Examens",short:"Exam.",name:"Examens : semaine allégée",rir:"RIR 3",sets:2,light:true,fin:0,cardio:30,acc:false,
    txt:"2 séries par exercice à RIR 3, sauts et Nordic en version légère, pas de finisher. Tu entretiens sans te fatiguer."},
  b2:{chip:"Bloc 2",short:"Bloc 2",name:"Bloc 2 : plus lourd",rir:"RIR 1-2",fin:12,cardio:45,acc:true,
    txt:"Tractions en 4 × 3-5 avec +2,5 kg, développé au sol en 4 × 5-8, fentes bulgares en 4 × 5-8, EMOM à 11 min. Le finisher passe à 12 min."},
  taper:{chip:"Affûtage",short:"Affût.",name:"Affûtage + tests",rir:"RIR 2",sets:2,light:true,noD:true,fin:0,cardio:30,acc:false,
    txt:"A, B et C à 2 séries, EMOM 6 min, pas de chin-ups ni de séance D. Tests le vendredi 18 décembre, reposé."},
  vac:{chip:"Vacances",short:"Vac.",name:"Vacances en France",rir:"RIR 2",fin:10,cardio:60,acc:false,vtt:true,
    txt:"Même programme avec ton matériel, à RIR 2. Ta sortie VTT remplace le mercredi. Si tu manques de temps : A, B et C seulement."},
  reprise:{chip:"Reprise",short:"Reprise",name:"Reprise",rir:"RIR 2",fin:8,cardio:35,acc:false,
    txt:"Charges −10 % par rapport à ta dernière semaine de décembre, RIR 2. Tu remontes dès la semaine suivante."},
  b3:{chip:"Bloc 3",short:"Bloc 3",name:"Bloc 3",rir:"RIR 1-2",fin:12,cardio:45,acc:true,
    txt:"Retour à la règle de la 1re série avec les formats du bloc 1. Isolation à RIR 0-1."},
  test:{chip:"Tests",short:"Tests",name:"Intersemestre + tests",rir:"RIR 2",fin:10,cardio:40,acc:false,
    txt:"Séances normales à RIR 2 du lundi au jeudi, tests le vendredi 26 février, séance D facultative."}
};
PH.cycleLight={chip:"Allégée",short:"Allég.",name:"Semaine allégée",rir:"RIR 3",sets:2,light:true,fin:0,cardio:30,acc:false,txt:"2 séries par exercice, RIR 3, sans finisher : consolider avant un nouveau cycle."};
function phase(n){var k=PKEY[n]||(n>21?((n-22)%6===5?"cycleLight":"b3"):"hist");var p=PH[k];p.key=k;return p;}
function expandWeeks(n){LAST=Math.max(LAST,n+8,todayWeek()+8);if(state&&state.weeks)Object.keys(state.weeks).forEach(function(k){var w=+k;if(isFinite(w))LAST=Math.max(LAST,w);});}
var TESTS={8:"samedi 28 novembre",11:"vendredi 18 décembre",21:"vendredi 26 février"};

/* ---------- Programme de base (V6.2, sans tenir compte des douleurs) ---------- */
var WARM={
  haut:{dur:"7 min",items:[["Cardio facile : montées de genoux, jumping jacks","2 min"],["Band pull-apart, élastique léger","15"],["Rotations externes d’épaule à l’élastique, coude au corps","12 / bras"],["Tractions scapulaires : bras tendus, tu bouges seulement les épaules","8"],["Séries d’approche du premier exercice","1-2"]]},
  basB:{dur:"8 min",items:[["Cardio léger","3 min"],["Marche latérale avec mini-élastique (sinon : abduction couché)","2 × 10 pas / côté"],["Fentes marchées","6 / jambe"],["Ponts fessiers","10"],["Squats au poids du corps","10"],["Sauts de préparation, de plus en plus hauts","3-4"]]},
  basD:{dur:"8 min",items:[["Cardio léger","3 min"],["Marche latérale avec mini-élastique","2 × 10 pas / côté"],["Ponts fessiers","10"],["Swings légers","5"],["Série d’approche de step-ups","1"]]}
};
var COOL="Retour au calme, 3 min : allongé sur le dos, inspire 5 s par le nez, expire 5 s.";
var LAT={sets:3,lo:8,hi:15,iso:1,lat:1,rest:45,restTxt:"45 s",tempo:"monte en 1 s, descends en 2 s",start:"2 × 5 kg",ph:"2 × 5 kg",up:"passe de 5 à 6-7 kg",q:"élévations latérales haltères technique",
  cues:["Debout, bras presque tendus, haltères le long du corps.","Monte les bras sur les côtés jusqu’à l’horizontale, pas plus haut, sans élan.","Redescends en 2 s. RIR 0-1 : la dernière rep doit être dure."],
  alts:[{k:"band",tag:"Matériel",name:"Élévations latérales à l’élastique",start:"élastique 10 sous les pieds",cues:["Élastique sous les pieds, une extrémité dans chaque main.","Même mouvement : monte jusqu’à l’horizontale, redescends lentement."]}]};
function cp(o,x){var r={};for(var k in o) r[k]=o[k];for(var k2 in x) r[k2]=x[k2];return r;}

var S={
 A:{code:"A",title:"Haut du corps · force",sub:"Puissance, tractions lourdes, développé au sol, épaules",day:"Lundi",dur:"≈ 70-85 min",tab:"Lun · Haut",warm:"haut",fin:"A8",ex:[
  {id:"A1",name:"Pompes explosives",sets:4,lo:5,hi:5,speed:1,noLoad:1,rest:90,restTxt:"90 s",tempo:"explosif",start:"poids du corps",up:"claque des mains quand c’est facile",q:"pompes explosives technique",
   cues:["Position de pompe, corps gainé, mains largeur d’épaules.","Descends contrôlé, puis pousse le plus fort possible : les mains décollent du sol.","Réception coudes souples, et enchaîne.","Arrête la série si la hauteur baisse."],
   alts:[{k:"table",tag:"Poignets / épaule",name:"Pompes explosives mains sur une table",cues:["Mains sur une table stable calée contre un mur, corps incliné.","Même principe : pousse fort, les mains décollent, réception souple."]}]},
  {id:"A2",name:"Tractions lestées, pronation",sets:4,lo:4,hi:6,main:1,ss:"A3p",rest:120,restTxt:"2 min après chaque exercice",tempo:"descente 2 s, pause 1 s en bas",start:"+15 kg",ph:"+15 kg",up:"+1 à 2,5 kg",q:"traction lestée pronation technique",
   by:function(k){if(k==="b2") return {lo:3,hi:5};},
   cues:["Mains un peu plus écartées que les épaules, paumes vers l’avant, les deux mains à la même hauteur.","Départ bras tendus, épaules basses, pause 1 s.","Monte jusqu’à passer le menton, redescends en 2 s.","Zéro balancier : la barre et la ceinture n’aiment pas ça."],
   alts:[{k:"light",tag:"Épaule",name:"Tractions lestées allégées",start:"ta charge −5 kg",tempo:"descente 3 s",cues:["Même mouvement avec 5 kg de moins et une descente en 3 s."]},
         {k:"row",tag:"Épaule",name:"Rowing inversé aux sangles, lesté",rx:{sets:4,lo:8,hi:12},start:"gilet, pieds sur une chaise",cues:["Sangles à hauteur de taille, talons sur une chaise, corps gainé.","Tire les poignées vers le bas des côtes, pause 1 s, descente en 2 s."]}]},
  {id:"A3p",label:"A3",name:"Développé au sol aux haltères",sets:4,lo:6,hi:10,main:1,ss:"A2",rest:120,restTxt:"2 min après chaque exercice",tempo:"descente 2 s, pause 1 s bras au sol",start:"2 × 18-20 kg",ph:"2 × 20 kg",up:"+1 à 2 kg par haltère",q:"dumbbell floor press technique",
   by:function(k){if(k==="b2") return {lo:5,hi:8};},
   cues:["Allongé au sol, genoux pliés, pieds à plat. Pour te mettre en place : assis, haltères posés debout sur les cuisses, puis roule en arrière en les gardant contre la poitrine.","Coudes à environ 45° du buste, paumes face à face ou légèrement tournées vers les pieds.","Descends en 2 s jusqu’à poser l’arrière des bras au sol, pause 1 s sans rebondir, puis pousse jusqu’aux bras tendus.","Le sol limite l’amplitude : l’épaule ne part pas en arrière comme aux dips."],
   alts:[{k:"dpush",tag:"Matériel",name:"Pompes lestées mains sur haltères",rx:{sets:4,lo:6,hi:10},start:"+10 kg (gilet)",noLoad:0,cues:["Mains sur deux haltères posés au sol (prise neutre), gilet et éventuellement un disque dans un sac à dos.","Descends en 2 s plus bas que les mains, coudes à 45°, puis pousse.","À utiliser quand tes haltères deviennent trop légers pour le développé au sol."]},
         {k:"strap",tag:"Épaule",name:"Pompes aux sangles",rx:{sets:4,lo:6,hi:12},start:"pieds au sol, sangles basses",cues:["Sangles à 10-20 cm du sol, corps gainé, coudes à 45°.","Descends jusqu’aux mains au niveau de la poitrine, sans aller plus bas si l’épaule tire.","Plus les pieds sont reculés, plus c’est dur ; ajoute le gilet ensuite."]}]},
  {id:"A4",name:"Rowing haltère à un bras",sets:3,lo:8,hi:12,side:"bras",ss:"A6",rest:60,restTxt:"60 s après chaque exercice",tempo:"pause 1 s en haut",start:"18 kg",ph:"18 kg",up:"+2 kg",q:"rowing haltère un bras technique",
   cues:["Main libre et genou sur une chaise, dos plat.","Tire l’haltère vers la hanche, coude près du corps.","Pause 1 s en haut, omoplate serrée, puis redescends bras tendu."],
   alts:[{k:"strap",tag:"Matériel",name:"Rowing aux sangles",rx:{sets:3,lo:10,hi:15},start:"poids du corps, pieds surélevés",cues:["Corps gainé, tire les poignées vers les côtes, pause 1 s."]}]},
  cp(LAT,{id:"A6",name:"Élévations latérales",ss:"A4",restTxt:"45 s après chaque exercice"}),
  {id:"A5",name:"Développé militaire haltères, assis",sets:3,lo:8,hi:12,ss:"A7",rest:60,restTxt:"60 s après chaque exercice",tempo:"descente 2 s",start:"2 × 10 kg",ph:"2 × 10 kg",up:"+1 à 2 kg par haltère",q:"développé militaire haltères assis technique",
   cues:["Assis sur une chaise, dos calé contre le dossier.","Haltères à hauteur d’oreilles, pousse au-dessus de la tête jusqu’aux bras tendus.","Pas de cambrure : abdos et fesses serrés."],
   alts:[{k:"pike",tag:"Épaule / matériel",name:"Pike push-ups pieds surélevés",start:"poids du corps",cues:["Pieds sur une chaise, bassin haut, corps en V à l’envers.","Descends la tête entre les mains, puis pousse."]}]},
  {id:"A7",name:"Roue abdominale",sets:3,lo:8,hi:12,ss:"A5",rest:45,restTxt:"45 s après chaque exercice",tempo:"aller en 3 s",start:"à genoux, +5 kg (gilet)",ph:"+5 kg",up:"+2,5 kg ; à +10 kg, passe debout face à un mur",q:"roue abdominale à genoux technique",
   cues:["À genoux, bras tendus, bassin rentré (fesses serrées).","Roule vers l’avant en 3 s sans jamais creuser le bas du dos.","Reviens en tirant avec les abdos."],
   alts:[{k:"plank",tag:"Dos",name:"Planche de face",rx:{sets:3,lo:30,hi:45,unit:"s"},start:"30 s",cues:["Avant-bras au sol, corps aligné, fesses serrées. Tiens."]}]}
 ]},
 B:{code:"B",title:"Bas du corps · force",sub:"Sauts, fentes, ischios, mollets",day:"Mardi",dur:"≈ 65-80 min",tab:"Mar · Bas",warm:"basB",ex:[
  {id:"B1",name:"Saut vertical max",kind:"jump",speed:1,noLoad:1,rest:60,restTxt:"60 s",tempo:"explosif",start:"mesure ta hauteur de référence",q:"saut vertical technique détente",
   by:function(k,n){if(k==="calib"||n===4||k==="reprise") return {sets:2,lo:3,hi:3};if(k==="exam") return {sets:2,lo:3,hi:3,tag:"léger"};if(k==="taper") return {sets:2,lo:2,hi:2};return {sets:3,lo:3,hi:3};},
   cues:["Debout de profil contre le mur, bras tendu : ta marque de départ (au scotch).","Flexion rapide, saute le plus haut possible et touche le mur au plus haut.","Atterrissage silencieux, genoux souples et dans l’axe.","Pas besoin d’un record à chaque séance : des sauts de qualité."],
   alts:[{k:"sj",tag:"Genou",name:"Squat jump sans contre-mouvement",cues:["Descends en squat, pause 2 s, puis saute sans re-fléchir.","Atterrissage amorti."]},
         {k:"swing",tag:"Genou, sans impact",name:"Swing à l’haltère",kind:"std",rx:{sets:3,lo:8,hi:8},noLoad:0,start:"20 kg",cues:["Charnière de hanche, les hanches propulsent l’haltère à hauteur de poitrine."]}]},
  {id:"B2",name:"Bonds latéraux",speed:1,noLoad:1,side:"côté",rest:60,restTxt:"60 s",tempo:"explosif",start:"petite distance",up:"augmente la distance si la réception reste propre",q:"bonds latéraux skater jump technique",
   by:function(k,n){if(k==="exam"||k==="taper") return {skip:1};if(k==="calib"||n===4||k==="reprise") return {sets:2,lo:3,hi:3};return {sets:3,lo:4,hi:4};},
   cues:["Sur une jambe, saute latéralement pour atterrir sur l’autre.","Réception stable 1 à 2 s, genou dans l’axe du pied.","Augmente la distance seulement si la réception reste propre."],
   alts:[{k:"walk",tag:"Genou, sans impact",name:"Marche latérale avec mini-élastique",rx:{sets:3,lo:10,hi:10},cues:["Élastique au-dessus des genoux, demi-flexion, pas latéraux sans relâcher la tension."]}]},
  {id:"B3",name:"Fentes bulgares",sets:4,lo:6,hi:10,side:"jambe",main:1,rest:75,restTxt:"75 s entre les jambes",tempo:"descente 2 s",start:"25 kg (gilet 10 + 2 × 7,5 kg)",ph:"25 kg",up:"+2,5 kg",q:"fente bulgare haltères technique",
   by:function(k){if(k==="b2") return {lo:5,hi:8};},
   cues:["Pied arrière posé sur une chaise, pied avant un grand pas devant.","Genou arrière vers le sol, genou avant dans l’axe du pied.","Buste un peu penché en avant, pousse dans tout le pied avant.","Commence par la jambe gauche, la droite fait le même nombre de reps."],
   alts:[{k:"rev",tag:"Genou",name:"Fentes arrière au sol",start:"2 × 12 kg",cues:["Grand pas en arrière, genou arrière qui frôle le sol, pousse dans le talon avant pour revenir."]},
         {k:"low",tag:"Genou",name:"Step-ups bas (marche de 15-20 cm)",start:"2 × 10 kg",cues:["Marche basse, pousse avec le pied posé dessus, redescends en 2 s."]}]},
  {id:"B4",name:"Soulevé de terre roumain sur une jambe",sets:3,lo:8,hi:12,side:"jambe",rest:120,restTxt:"2 min après les deux jambes",tempo:"descente 3 s",start:"1 haltère de 12-14 kg",ph:"14 kg",up:"+2 kg ; au-delà de 22 kg, prends les 2 haltères",q:"soulevé de terre roumain une jambe haltère",
   cues:["Haltère dans la main opposée à la jambe d’appui, main libre en appui léger sur un mur si besoin.","Genou d’appui un peu fléchi, la hanche recule, la jambe libre part en arrière.","Dos plat, descends en 3 s jusqu’à l’étirement derrière la cuisse.","Remonte en poussant la hanche vers l’avant, bassin bien de face."],
   alts:[{k:"bil",tag:"Équilibre",name:"Soulevé de terre roumain, deux jambes",start:"2 × 20 kg",cues:["Haltères devant les cuisses, fesses en arrière, dos plat, descente en 3 s."]},
         {k:"bridge",tag:"Dos",name:"Pont fessier lesté",rx:{sets:3,lo:10,hi:15},start:"20 kg",cues:["Allongé, haltère sur les hanches, monte les hanches et serre 2 s."]}]},
  {id:"B5",name:"Nordic curl",kind:"fixed",noLoad:1,ss:"B5b",rest:60,restTxt:"60 s après chaque exercice",tempo:"descente 4 s",start:"2 × 3",q:"nordic curl débutant assisté",
   by:function(k,n){if(n===3) return {sets:2,lo:3,hi:3};if(n===4) return {sets:2,lo:3,hi:4};if(n===5||n===6) return {sets:2,lo:4,hi:5};if(n===7) return {sets:3,lo:4,hi:4};
     if(k==="exam") return {sets:2,lo:2,hi:3,tag:"léger"};if(k==="taper") return {sets:2,lo:3,hi:3};if(k==="vac") return {sets:2,lo:4,hi:5};if(k==="reprise") return {sets:2,lo:3,hi:4};if(k==="test") return {sets:2,lo:4,hi:4};return {sets:3,lo:4,hi:6};},
   cues:["À genoux sur un coussin, talons bloqués sous le canapé.","Corps droit des genoux aux épaules, fesses serrées.","Descends le plus lentement possible (4 s), rattrape-toi avec les mains en bas.","Remonte en t’aidant des mains : c’est la descente qui compte."],
   alts:[{k:"curl",tag:"Ischios",name:"Leg curl aux sangles",kind:"std",rx:{sets:3,lo:8,hi:12},start:"poids du corps",cues:["Talons dans les sangles, pont fessier, ramène les talons vers les fesses, retour en 3 s."]}]},
  {id:"B5b",label:"B5 bis",name:"Planche Copenhague",sets:3,lo:15,hi:30,unit:"s",side:"côté",noLoad:1,ss:"B5",rest:60,restTxt:"60 s après chaque exercice",tempo:"tenue",start:"15 s, genou sur la chaise",up:"+5 s ; à 30 s, passe le pied sur la chaise et reviens à 15 s",q:"copenhagen plank technique",
   cues:["Allongé sur le côté, avant-bras au sol. Genou du dessus posé sur une chaise stable et calée.","Monte le bassin pour aligner épaules, hanches et genou.","Tiens sans laisser tomber les hanches."],
   alts:[{k:"side",tag:"Adducteurs",name:"Planche latérale",rx:{sets:3,lo:30,hi:45,unit:"s"},cues:["Coude sous l’épaule, corps aligné, hanches hautes."]}]},
  {id:"B6",name:"Mollets debout à une jambe",sets:3,lo:10,hi:15,side:"jambe",iso:1,rest:60,restTxt:"60 s",tempo:"pause 2 s en bas",start:"10 kg",ph:"10 kg",up:"+2 kg",q:"mollets unilatéral marche haltère",
   cues:["Avant du pied sur une marche, talon dans le vide, une main au mur.","Descends au maximum, pause 2 s, monte au maximum, pause 1 s.","RIR 0-1 : la dernière rep doit être dure."]},
  {id:"B7",name:"Crunch lesté",sets:3,lo:10,hi:15,rest:60,restTxt:"60 s",tempo:"pause 1 s en haut",start:"10 kg sur la poitrine",ph:"10 kg",up:"+2 kg",q:"crunch lesté haltère technique",
   cues:["Allongé, genoux pliés, haltère tenu sur la poitrine.","Enroule la colonne : épaules puis haut du dos décollent, le bas du dos reste au sol.","Pause 1 s, redescends lentement."],
   alts:[{k:"band",tag:"Matériel",name:"Crunch à genoux à l’élastique",start:"élastique 40",cues:["À genoux face à la barre, élastique derrière la tête, enroule le dos vers le sol."]}]}
 ]},
 E:{code:"E",title:"Endurance",sub:"Course facile + accélérations",day:"Mercredi",dur:"35-60 min",tab:"Mer · Cardio",ex:[]},
 C:{code:"C",title:"Haut du corps · volume",sub:"Tractions, pompes lestées, épaules, bras",day:"Jeudi",dur:"≈ 75-85 min",tab:"Jeu · Haut",warm:"haut",fin:"C9",ex:[
  {id:"C1",name:"EMOM tractions",kind:"emom",noLoad:1,tempo:"dynamique",start:"10 min × 5",q:"EMOM tractions",
   by:function(k){if(k==="b2") return {sets:11,lo:5,hi:5};if(k==="exam"||k==="taper") return {sets:6,lo:5,hi:5};if(k==="reprise") return {sets:9,lo:5,hi:5};return {sets:10,lo:5,hi:5};},
   cues:["Au début de chaque minute : 5 tractions propres et dynamiques, puis repos jusqu’à la minute suivante. Si tu es frais, tu peux en faire 6 sur les premières minutes, mais pas au prix des dernières.","Jamais à l’échec : si tu n’arrives plus à 5 propres, termine à 4.","Le chrono bipe à chaque nouvelle minute."]},
  {id:"C2",name:"Chin-ups lestés",sets:3,lo:6,hi:10,main:1,ss:"C3",rest:90,restTxt:"90 s après chaque exercice",tempo:"descente 2 s, pause 1 s en haut",start:"+5 kg",ph:"+5 kg",up:"+2,5 kg",q:"chin up lesté technique",
   by:function(k){if(k==="taper") return {skip:1};},
   cues:["Paumes vers toi, mains largeur d’épaules.","Départ bras tendus, monte la poitrine vers la barre, pause 1 s.","Redescends en 2 s."]},
  {id:"C3",name:"Pompes lestées pieds surélevés",sets:4,lo:8,hi:12,main:1,ss:"C2",rest:90,restTxt:"90 s après chaque exercice",tempo:"descente 2 s",start:"+10 kg (gilet)",ph:"+10 kg",up:"+2,5 kg (disque dans un sac à dos par-dessus le gilet)",q:"pompes pieds surélevés lestées technique",
   cues:["Pieds sur une chaise, mains un peu plus larges que les épaules.","Corps gainé comme une planche, coudes à 45°.","Descends en 2 s jusqu’à frôler le sol, puis pousse. Même amplitude à chaque rep."],
   alts:[{k:"floor",tag:"Épaule",name:"Pompes au sol, même lest",cues:["Mains au sol, même lest, même technique."]},
         {k:"dbp",tag:"Épaule",name:"Développé au sol aux haltères",start:"2 × 20 kg",cues:["Allongé, arrière des bras jusqu’au sol, coudes à 45°, pause 1 s, pousse."]}]},
  cp(LAT,{id:"C4",name:"Élévations latérales",sets:4}),
  {id:"C5",name:"Face pull aux sangles",sets:3,lo:12,hi:15,rest:45,restTxt:"45 s",tempo:"pause 2 s",start:"poids du corps",ph:"PDC",up:"corps plus incliné",q:"face pull TRX sangles",
   cues:["Sangles à hauteur de poitrine, penche-toi en arrière bras tendus, corps gainé.","Tire les poignées vers ton front, coudes hauts, pouces vers l’arrière.","Pause 2 s, redescends lentement."],
   alts:[{k:"band",tag:"Matériel",name:"Face pull à l’élastique",start:"élastique 10",cues:["Élastique accroché à hauteur de visage, même mouvement."]}]},
  {id:"C6",name:"Curl haltères",sets:3,lo:8,hi:12,iso:1,ss:"C7",rest:45,restTxt:"45 s après chaque exercice",tempo:"descente 2 s",start:"2 × 10 kg",ph:"2 × 10 kg",up:"+1 à 2 kg",q:"curl biceps haltères technique",
   cues:["Debout, coudes collés aux côtes.","Monte sans balancer, redescends en 2 s.","Une semaine sur deux, fais-les en prise marteau (paumes face à face)."],
   alts:[{k:"band",tag:"Matériel",name:"Curl à l’élastique",start:"élastique 20",cues:["Élastique sous les pieds, même mouvement."]}]},
  {id:"C7",name:"Extension triceps au-dessus de la tête",sets:3,lo:10,hi:15,iso:1,ss:"C6",rest:45,restTxt:"45 s après chaque exercice",tempo:"descente 2 s",start:"1 haltère de 12 kg",ph:"12 kg",up:"+2 kg",q:"extension triceps haltère au-dessus de la tête",
   cues:["Un haltère tenu à deux mains au-dessus de la tête.","Coudes vers le plafond, descends derrière la tête jusqu’à l’étirement.","Tends les bras sans écarter les coudes."],
   alts:[{k:"push",tag:"Épaule",name:"Extension triceps à l’élastique, vers le bas",start:"élastique 20",cues:["Élastique accroché à la barre, coudes collés au corps, pousse vers le bas."]}]},
  {id:"C8",name:"Relevés de jambes suspendu",sets:3,lo:8,hi:15,rest:60,restTxt:"60 s",tempo:"descente 2 s",start:"genoux pliés",ph:"PDC",up:"jambes tendues",q:"relevé de jambes suspendu technique",
   cues:["Suspendu, épaules engagées.","Monte les genoux vers la poitrine en enroulant le bassin, zéro balancier.","Redescends en 2 s."],
   alts:[{k:"floor",tag:"Prise / épaule",name:"Relevés de jambes au sol",cues:["Allongé, mains sous les fesses, monte les jambes et décolle le bassin."]}]}
 ]},
 D:{code:"D",title:"Bas du corps · volume",sub:"Puissance des hanches, unilatéral, gainage",day:"Samedi",dur:"≈ 55-65 min",tab:"Sam · Bas",warm:"basD",ex:[
  {id:"D1",name:"Swing à l’haltère",sets:3,lo:10,hi:10,speed:1,rest:90,restTxt:"90 s",tempo:"explosif",start:"20-22 kg",ph:"20 kg",up:"haltère plus lourd",q:"kettlebell swing avec haltère technique",
   cues:["Haltère tenu à deux mains par une extrémité.","Charnière de hanche, pas un squat : fesses en arrière, haltère entre les jambes.","Claque les hanches vers l’avant : l’haltère monte à hauteur de poitrine, bras passifs, dos plat.","Arrête la série si la vitesse baisse."],
   alts:[{k:"bridge",tag:"Dos",name:"Pont fessier explosif",cues:["Allongé, monte les hanches le plus vite possible, pause 1 s, redescends contrôlé."]}]},
  {id:"D2",name:"Step-ups lestés",sets:3,lo:8,hi:12,side:"jambe",main:1,rest:75,restTxt:"75 s entre les jambes",tempo:"descente 2 s",start:"20 kg (gilet 10 + 2 × 5 kg)",ph:"20 kg",up:"+2,5 kg",q:"step up lesté technique",
   cues:["Chaise calée contre un mur ou marche à hauteur sous le genou.","Pousse avec le pied posé dessus, zéro élan avec la jambe du bas.","Redescends lentement."],
   alts:[{k:"rev",tag:"Genou",name:"Fentes arrière lestées",start:"2 × 12 kg",cues:["Grand pas en arrière, genou arrière qui frôle le sol."]},
         {k:"low",tag:"Genou",name:"Step-ups bas (15-20 cm)",cues:["Même mouvement sur une marche basse."]}]},
  {id:"D3",name:"Hip thrust sur une jambe",sets:3,lo:8,hi:12,side:"jambe",main:1,ss:"D4",rest:60,restTxt:"60 s après chaque exercice",tempo:"pause 2 s en haut",start:"10-12 kg",ph:"12 kg",up:"+2 kg",q:"hip thrust une jambe canapé",
   cues:["Haut du dos sur le canapé, un pied au sol, haltère sur la hanche qui travaille (serviette dessous).","Pousse dans le talon jusqu’à aligner genou, hanche et épaule.","Pause 2 s, fessier serré, menton rentré."],
   alts:[{k:"floor",tag:"Matériel",name:"Pont fessier une jambe au sol",cues:["Dos au sol, même mouvement."]}]},
  {id:"D4",name:"Leg curl à l’élastique, assis",sets:3,lo:10,hi:15,iso:1,ss:"D3",rest:60,restTxt:"60 s après chaque exercice",tempo:"retour en 3 s",start:"élastique 40",ph:"él. 40",up:"recule la chaise",q:"leg curl élastique assis",
   cues:["Assis sur une chaise, élastique ancré bas devant toi, passé derrière la cheville.","Ramène le talon sous la chaise, pause 1 s.","Retour en 3 s."],
   alts:[{k:"strap",tag:"Matériel",name:"Leg curl aux sangles",cues:["Talons dans les sangles, pont fessier, ramène les talons vers les fesses."]}]},
  {id:"D5",name:"Mollets assis",sets:3,lo:12,hi:20,iso:1,ss:"D6",rest:45,restTxt:"45 s après chaque exercice",tempo:"pause 2 s en bas",start:"1 haltère de 20 kg sur les genoux",ph:"20 kg",up:"+2 kg",q:"mollets assis haltère",
   cues:["Assis, avant des pieds sur un livre épais, haltère sur les genoux.","Descends les talons au maximum, pause 2 s, monte au maximum."]},
  {id:"D6",name:"Abduction de hanche, couché sur le côté",sets:2,lo:15,hi:20,side:"côté",ss:"D5",rest:45,restTxt:"45 s après chaque exercice",tempo:"pause 1 s en haut",start:"poids du corps",ph:"PDC",up:"mini-élastique au-dessus des genoux ou haltère léger",q:"abduction hanche allongé sur le côté",
   cues:["Jambe du dessus tendue, légèrement en arrière, pointe de pied vers l’avant.","Monte sans rouler le bassin, pause 1 s, redescends en 2 s."],
   alts:[{k:"walk",tag:"Matériel",name:"Marche latérale avec mini-élastique",rx:{sets:2,lo:10,hi:15},cues:["Élastique au-dessus des genoux, demi-flexion, pas latéraux."]}]},
  {id:"D7",name:"Planche latérale",sets:2,lo:30,hi:45,unit:"s",side:"côté",noLoad:1,rest:45,restTxt:"45 s",tempo:"tenue",start:"30 s",up:"+5 s par semaine ; à 45 s, lève le pied du dessus",q:"planche latérale technique",
   cues:["Coude sous l’épaule, corps aligné, hanches hautes. Respire."],
   alts:[{k:"front",tag:"Épaule",name:"Planche de face",cues:["Avant-bras au sol, corps aligné."]}]}
 ]}
};
var ORDER=["A","B","E","C","D"];
var TABS=["plan","live","A","B","E","C","D","progres","regles"];
/* Exercices retirés du programme : gardés pour l’historique, les graphiques et l’export */
var RETIRED=[
  {id:"A3",name:"Dips lestés",sets:4,lo:5,hi:8,main:1,retired:"A",rest:120,restTxt:"2 min après chaque exercice",tempo:"descente 2 s",start:"+12,5 kg sur station, +10 kg max entre chaises",ph:"+12,5 kg",up:"+2,5 kg",q:"dips lestés technique",
   by:function(k){if(k==="b2") return {lo:3,hi:5};},
   cues:["Sur la station de dips, ou entre deux chaises solides calées contre un mur.","Buste un peu penché en avant, coudes qui partent vers l’arrière.","Descends jusqu’à 90° au coude, pas plus bas, puis pousse jusqu’aux bras tendus.","Entre deux chaises, ne dépasse pas +10 kg."],
   alts:[{k:"push",tag:"Épaule / matériel",name:"Pompes lestées pieds surélevés",rx:{sets:4,lo:6,hi:10},start:"+10 kg (gilet)",cues:["Pieds sur une chaise, corps gainé, coudes à 45°.","Descends en 2 s jusqu’à frôler le sol, puis pousse."]},
         {k:"floor",tag:"Épaule",name:"Développé au sol aux haltères",rx:{sets:4,lo:6,hi:10},start:"2 × 20 kg",cues:["Allongé, genoux pliés. Descends jusqu’à poser l’arrière des bras au sol, coudes à 45°.","Pause 1 s, puis pousse."]}]}
];
var ALLEX={};ORDER.forEach(function(s){S[s].ex.forEach(function(e){ALLEX[e.id]=e;});});RETIRED.forEach(function(e){ALLEX[e.id]=e;});
function exAll(sid){return S[sid].ex.concat(RETIRED.filter(function(e){return e.retired===sid;}));}

/* ---------- Historique : ton carnet d'avant le 19 octobre (S0 = sem. du 28 sept., S1, S2) ----------
   Chaque exercice est rattaché à son équivalent V6.2, quel que soit le jour où tu le faisais. */
var HIST=[];
function hS(w,id,v,load,sets,note){HIST.push({w:w,id:id,v:v,load:load,sets:sets,note:note||""});}
function hE(w,id,total,note){HIST.push({w:w,id:id,v:"",total:total,note:note||""});}
hS(0,"A2","","+12 kg",[6,5,5,5]);                 hS(1,"A2","","+15 kg",[5,5,5,5]);                  hS(2,"A2","","+15 kg",[5,5,5,5,3]);
hS(0,"C3","","+10 kg",[10,10,10,10],"Lundi aussi : 12/10/10/9"); hS(1,"C3","","+10 kg",[11,11,10,10],"RIR 0 à la fin · lundi aussi : 12/10/10/10"); hS(2,"C3","","+10 kg",[11,11,10,10],"Lundi aussi : 11/11/10/10");
hS(0,"A4","strap","+10 kg",[8,8,8,8],"pieds surélevés"); hS(1,"A4","strap","+10 kg",[8,7,6.5],"pieds surélevés"); hS(2,"A4","strap","+10 kg",[8,7,6.5],"pieds surélevés");
hS(0,"A3","","+10 kg",[8,9,9],"entre deux chaises"); hS(1,"A3","","+10 kg",[9,9,10],"entre deux chaises");
hS(0,"A7","","",[12,10,9,9]);                       hS(1,"A7","","",[10,10,9,10]);                      hS(2,"A7","","+5 kg",[10,10,8]);
hS(0,"A6","","5 kg",[8,8,8]);                      hS(1,"A6","","5 kg",[9,8,8]);                      hS(2,"A6","","5 kg",[9,8,8],"Lundi aussi : 10/10/10");
hS(0,"C4","","5 kg",[9,9]);                         hS(1,"C4","","5 kg",[9,9,9]);                      hS(2,"C4","","5 kg",[9,9,9]);
hE(0,"C1","56","10 min : 6/6/6/6/6/6/5/5/5/5");     hE(1,"C1","56","10 min : 6/6/6/6/6/6/5/5/5/5");    hE(2,"C1","57","11 min : 6/6/6/6/6/6/5/5/3/4/4");
hS(0,"A5","pike","",[10,7,7],"pieds surélevés");   hS(1,"A5","pike","",[9,6,7,7],"pieds surélevés"); hS(2,"A5","pike","",[8,8,8,6],"pieds surélevés");
hS(0,"C7","","14 kg",[8,8,6]);                      hS(1,"C7","","sangle",[8,10,12],"à la sangle");     hS(2,"C7","","6 kg",[6,6,6]);
hS(0,"B7","","10 kg",[15,14,14],"Aussi à l’élastique 40 kg : 10/12/12"); hS(1,"B7","","10 kg",[12,12,12],"Aussi à l’élastique 40 kg : 12/11/11"); hS(2,"B7","","12 kg",[11,10,10],"Aussi à l’élastique 40 kg : 16/12/13");
hS(0,"B3","","20 kg",[10,9,8,8]);                  hS(1,"B3","","20 kg",[9,9,9,9]);                   hS(2,"B3","","20 kg",[9,9,10,10],"Lundi aussi : 8/8/8");
hS(0,"B4","","10 kg",[8,7,8]);                      hS(1,"B4","","10 kg",[8,8,8]);                     hS(2,"B4","","12 kg",[8,8,8]);
hS(0,"D4","","40 kg (élastique)",[10,10,10]);       hS(1,"D4","","40 kg (élastique)",[10,10,10]);
hS(0,"D2","","20 kg",[10,10,10]);                  hS(1,"D2","","20 kg",[10,10,10]);                  hS(2,"D2","","20 kg",[10,10,10]);
hS(1,"B6","","10 kg",[11,11,10]);                   hS(2,"B6","","10 kg",[10,10,10]);
hS(0,"C2","","+10 kg",[7,6,6,6]);                   hS(1,"C2","","+10 kg",[5,6,6,6]);                  hS(2,"C2","","+10 kg",[6,6,6,6]);
hS(0,"C6","","10 kg",[10,9,8]);                     hS(1,"C6","","10 kg",[8,8,8]);                     hS(2,"C6","","10 kg",[9,9,8]);
/* Programme d'été (S1 = semaine du 20 juillet ; pause du 10 au 16 août, donc S2 = 3 août et S3 = 17 août) */
var SU={1:wDate("20/07"),2:wDate("03/08"),3:wDate("17/08"),4:wDate("24/08"),5:wDate("31/08"),6:wDate("07/09"),7:wDate("14/09")};
function hEm(w,arr,extra){var t=0;arr.forEach(function(x){t+=x;});hE(w,"C1",String(t),arr.length+" min : "+arr.join("/")+(extra?" · "+extra:""));}
hEm(wDate("11/05"),[5,5,4,3,3,2,2,2,2,3]); hEm(wDate("18/05"),[4,4,4,4,4,4,4,4,4,4]); hEm(wDate("25/05"),[5,5,5,5,5,4,4,4,4,4]);
hEm(SU[1],[6,6,5,5,5,5,5,5,4,4],"difficile"); hEm(SU[2],[5,5,5,5,4,4,3,3,4,4],"fait le lendemain, 1re tentative incomplète"); hEm(SU[3],[6,5,5,6,5,5,6,5,4,4]);
hEm(SU[4],[6,5,6,5,6,5,5,5,4,4]); hEm(SU[5],[6,5,5,5,5,4,4,4,4,4],"rhume"); hEm(SU[6],[6,5,6,5,6,5,5,4,5,4]); hEm(SU[7],[6,6,6,6,6,5,5,4,5,5]);
(function(){
  var L="+0 kg",d={
   A2:[[1,[7,6,7,6]],[2,[8,6,6,6]],[3,[8,6,6,6]],[4,[8,7,7,6]],[5,[8,8,6,7]],[6,[8,8,7,6]],[7,[8,8,7,6,6]]],
   A3:[[1,[12,12,12,13],"pieds surélevés"],[2,[12,12,12,12]],[3,[12,12,12,12]],[4,[12,12,12,12]],[7,[14,11,13,12],"Vendredi aussi : 12/12/11/12"]],
   C3:[[1,[12,12,10,11],"tempo lent · lundi aussi : 13/13/13/13"],[2,[12,12,12,11]],[3,[12,12,12,10]],[4,[12,11,11,12]],[5,[15,14,13,12]],[6,[13,10,8,10]],[7,[14,12,12,12]]],
   C2:[[1,[8,8,8,7]],[3,[8,8,8,7]],[4,[8,9,8,8]],[5,[7,6,6,6]],[6,[6,6,6,6]],[7,[10,10,7,6]]]
  };
  for(var id in d) d[id].forEach(function(r){hS(SU[r[0]],id,"",L,r[1],r[2]);});
  [[1,[12,10,8,6]],[2,[10,10,10,8]],[3,[10,10,8,8]],[4,[10,10,8,8]],[7,[10,10,10,10]]].forEach(function(r){hS(SU[r[0]],"A4","strap",L,r[1],"rowing inversé sous la barre, pieds surélevés");});
  [[1,[10,9,10,10]],[2,[12,12,12,12]],[3,[12,12,12,12]],[4,[12,12,12,12]],[7,[11,10,10,11]]].forEach(function(r){hS(SU[r[0]],"A7","","",r[1]);});
  [[1,[10,8,8,8]],[2,[8,8,6,7],"pieds à 75 cm du sol"],[6,[8,7,6,8]]].forEach(function(r){hS(SU[r[0]],"A5","pike","",r[1],r[2]);});
  [[1,[10,12,12,9]],[2,[12,12,12,12]],[3,[10,12,10,12]],[4,[14,12,13,13]],[5,[12,12,12,14]]].forEach(function(r){hS(SU[r[0]],"A6","band","élastique 10 kg",r[1]);});
  [[1,[10,10,10]],[3,[10,10,10]],[4,[10,10,10]]].forEach(function(r){hS(SU[r[0]],"C6","band","élastique 30 kg",r[1]);});
  [[1,[10,9,9],"échec à la 2e série"],[3,[10,10,8]],[4,[10,8,9,9]],[6,[8,9,8,9]],[7,[10,9,9,9]]].forEach(function(r){hS(SU[r[0]],"C8","","",r[1],r[2]);});
})();
/* Mesures et tests (poids : tes pesées ; test des tractions strictes à la 1re semaine de l'été) */
var HBODY=[[wDate("25/01"),"54,6"],[wDate("19/04"),"55,2"],[wDate("27/06"),"57,9"]];
var HTESTS=[[SU[1],"12"],[0,"16"]];
function buildHistory(){
  var w={};
  function wkOf(n){return w[n]||(w[n]={week:n,ex:{},done:{},body:{},sess:{},tests:{}});}
  HIST.forEach(function(r){
    var ex=ALLEX[r.id];if(!ex) return;
    var e={v:r.v,at:1},note=r.note;
    if(r.total!=null) e.total=r.total;
    else {
      var alt=null;(ex.alts||[]).forEach(function(a){if(a.k===r.v) alt=a;});
      var cap=(alt&&alt.rx&&alt.rx.sets)||ex.sets||r.sets.length,sets=r.sets.map(String),extra=sets.slice(cap);
      /* une série en plus de la V6.2 ne fausse pas les consignes : on la garde en note */
      if(extra.length) note=(note?note+" · ":"")+"séries en plus : "+extra.join("/");
      e.sets=sets.slice(0,cap);if(r.load) e.load=r.load;
    }
    if(note) e.note=note;
    wkOf(r.w).ex[r.id]=e;
  });
  HBODY.forEach(function(r){wkOf(r[0]).body={weight:r[1],at:1};});
  HTESTS.forEach(function(r){wkOf(r[0]).tests={pull:r[1],at:1};});
  return w;
}
var LS_HV="carnet62.histv";
function ensureHistory(){
  var h=buildHistory(),added=false;
  for(var k in h){if(!state.weeks[k]){state.weeks[k]=h[k];added=true;}}
  /* une seule fois : poids de départ (61 kg, noté le 19 oct.) dans la semaine S3 si elle est vide */
  if((lsGet(LS_HV)||0)<2){var b=wk(3).body;if(!b.weight){b.weight="61";b.at=1;added=true;}lsSet(LS_HV,2);}
  if(added) cacheLocal();
}

/* ---------- Schémas des muscles (dessinés ici, fonctionnent hors connexion) ---------- */
var MN={pecs:"pectoraux",delt_a:"deltoïde antérieur",delt_s:"deltoïde latéral",delt_p:"deltoïde postérieur",biceps:"biceps",triceps:"triceps",forearm:"avant-bras",abs:"abdominaux",obl:"obliques",flex:"fléchisseurs de hanche",quads:"quadriceps",add:"adducteurs",traps:"trapèzes",lats:"grand dorsal",rhomb:"milieu du dos",erec:"lombaires",glute:"grand fessier",gmed:"moyen fessier",ham:"ischio-jambiers",calf:"mollets"};
/* moitié gauche de chaque forme ; l'autre moitié est le miroir autour de x = 100 */
var BODY_F="M100 56L88 56L70 62Q52 62 44 74Q40 90 41 104L38 150L33 205L31 216Q29 232 37 238Q46 239 47 226L51 212L54 152L58 110Q62 102 66 100L68 112L72 150Q70 175 66 192Q58 230 63 262L66 290Q62 325 63 345L65 372L58 388L82 388L84 372L86 335L88 290Q92 250 98 212L100 208Z";
var BODY_B=BODY_F;
var FRONT={
  traps:"M93 53Q84 59 70 63L76 67Q88 63 98 63L98 54Z",
  delt_s:"M52 64Q44 70 42 84Q40 94 42 102L52 100Q50 84 56 66Z",
  delt_a:"M57 66Q50 84 52 100L60 100Q66 88 72 74L70 63Q63 63 57 66Z",
  pecs:"M99 66L74 68Q63 80 67 96Q80 108 99 100Z",
  biceps:"M43 106L58 104Q60 128 56 149L40 149Q41 128 43 106Z",
  forearm:"M39 153L55 153L51 207L36 209Z",
  abs:"M99 104L85 108L85 170Q90 180 99 182Z",
  obl:"M72 104L84 108L84 172Q76 176 70 168L72 134Z",
  flex:"M85 178Q91 186 99 186L99 204Q92 206 87 196Z",
  quads:"M64 198L88 206Q85 250 82 286L66 288Q60 250 64 198Z",
  add:"M89 206L98 210Q94 250 90 286L83 286Q86 250 89 206Z",
  calf:"M66 296L87 296Q85 330 85 366L66 366Q62 330 66 296Z"
};
var BACK={
  traps:"M99 56L88 58L70 66Q80 70 92 84L99 92Z",
  rhomb:"M92 88Q80 74 72 76Q74 94 82 106L99 112L99 96Z",
  delt_p:"M70 64Q52 62 44 74Q40 90 42 102L58 100Q64 86 72 70Z",
  lats:"M69 102Q74 110 84 114L99 116L99 150L86 152Q74 136 68 116Z",
  erec:"M86 154L99 152L99 192L84 190Q82 170 86 154Z",
  triceps:"M43 106L58 104Q60 128 56 149L40 149Q41 128 43 106Z",
  forearm:"M39 153L55 153L51 207L36 209Z",
  gmed:"M64 184Q76 184 88 191Q80 200 66 201Q60 194 64 184Z",
  glute:"M66 203Q64 220 72 232Q86 238 99 230L99 203Q84 208 66 203Z",
  ham:"M64 238L98 234Q94 262 90 286L66 288Q60 264 64 238Z",
  calf:"M64 296Q60 320 66 348L85 348Q89 320 87 296Z"
};
function anatSvg(P,S,which){
  var shapes=which==="f"?FRONT:BACK, h='<svg viewBox="0 0 200 392" class="an" aria-hidden="true" focusable="false"><g class="an-body"><circle cx="100" cy="25" r="17"/><rect x="91" y="40" width="18" height="18" rx="4"/>';
  h+='<path d="'+BODY_F+'"/><path d="'+BODY_F+'" transform="matrix(-1 0 0 1 200 0)"/></g>';
  for(var k in shapes){
    var c=P.indexOf(k)>=0?"mp":(S.indexOf(k)>=0?"ms":"mo");
    h+='<path class="'+c+'" d="'+shapes[k]+'"/><path class="'+c+'" d="'+shapes[k]+'" transform="matrix(-1 0 0 1 200 0)"/>';
  }
  if(which==="f") h+='<path class="an-gap" d="M85 126H115M85 146H115M85 164H115"/>';
  return h+'</svg>';
}

/* esc, yt et state sont définis plus bas : ces fonctions ne sont appelées qu'après le chargement complet */

/* Muscles par exercice : p = principaux, s = secondaires ; « alt » = écarts pour une variante précise (clé id:variante) */
var MUSC={
 A1:{p:["pecs","triceps","delt_a"],s:["abs"]},
 A2:{p:["lats"],s:["biceps","rhomb","forearm","delt_p"]},
 "A2:row":{p:["lats","rhomb","delt_p"],s:["biceps","forearm"]},
 A3:{p:["pecs","triceps"],s:["delt_a"]},
 A3p:{p:["pecs","triceps"],s:["delt_a"]},
 "A3p:dpush":{p:["pecs","triceps","delt_a"],s:["abs"]},
 "A3p:strap":{p:["pecs","triceps","delt_a"],s:["abs","delt_s"]},
 "A3:push":{p:["pecs","delt_a","triceps"],s:["abs"]},
 A4:{p:["lats","rhomb"],s:["biceps","delt_p","forearm"]},
 A5:{p:["delt_a","delt_s"],s:["triceps","traps"]},
 A6:{p:["delt_s"],s:["traps"]},
 A7:{p:["abs"],s:["obl","lats","delt_a"]},
 "A7:plank":{p:["abs","obl"],s:["delt_a","glute"]},
 A8:{p:["quads","glute","pecs","delt_a"],s:["abs","triceps","calf"]},
 B1:{p:["quads","glute","calf"],s:["ham"]},
 "B1:swing":{p:["glute","ham"],s:["erec","forearm"]},
 B2:{p:["gmed","glute","quads"],s:["calf","add"]},
 "B2:walk":{p:["gmed"],s:["glute","quads"]},
 B3:{p:["quads","glute"],s:["ham","add","gmed"]},
 B4:{p:["ham","glute"],s:["erec","gmed","forearm"]},
 "B4:bridge":{p:["glute"],s:["ham","erec"]},
 B5:{p:["ham"],s:["calf","glute"]},
 B5b:{p:["add"],s:["obl","gmed","abs"]},
 "B5b:side":{p:["obl","gmed"],s:["abs","delt_s"]},
 B6:{p:["calf"],s:[]},
 B7:{p:["abs"],s:["obl"]},
 C1:{p:["lats","biceps"],s:["rhomb","forearm","delt_p"]},
 C2:{p:["lats","biceps"],s:["rhomb","forearm","delt_p"]},
 C3:{p:["pecs","delt_a","triceps"],s:["abs"]},
 C4:{p:["delt_s"],s:["traps"]},
 C5:{p:["delt_p","rhomb"],s:["traps","biceps"]},
 C6:{p:["biceps"],s:["forearm"]},
 C7:{p:["triceps"],s:["delt_a"]},
 C8:{p:["abs","flex"],s:["obl","forearm"]},
 C9:{p:["quads","glute","pecs","delt_a"],s:["abs","triceps","calf"]},
 D1:{p:["glute","ham"],s:["erec","forearm","delt_a","abs"]},
 "D1:bridge":{p:["glute"],s:["ham","erec"]},
 D2:{p:["quads","glute"],s:["ham","gmed","calf"]},
 D3:{p:["glute"],s:["ham","gmed"]},
 D4:{p:["ham"],s:["calf"]},
 D5:{p:["calf"],s:[]},
 D6:{p:["gmed"],s:["glute"]},
 D7:{p:["obl","gmed"],s:["abs","delt_s"]},
 "D7:front":{p:["abs"],s:["obl","delt_a","glute"]},
 E1:{p:["quads","calf","glute"],s:["ham","abs"]}
};
function muscOf(id,altK){return (altK&&MUSC[id+":"+altK])||MUSC[id]||null;}
function names(a){return a.map(function(k){return MN[k];}).join(", ");}
function anatBlock(m){
  var lab=names(m.p)+(m.s.length?". Secondaire : "+names(m.s):"");
  return '<figure class="an-fig"><div class="an-pair" role="img" aria-label="Schéma des muscles sollicités, vue de face et de dos">'+anatSvg(m.p,m.s,"f")+anatSvg(m.p,m.s,"b")+'</div><div class="an-cap"><span><i class="mp"></i>Principal</span><span><i class="ms"></i>Secondaire</span><span>face · dos</span></div></figure>'+
   '<p class="pe-mus"><b>Principal :</b> '+esc(names(m.p))+'.'+(m.s.length?' <b>Secondaire :</b> '+esc(names(m.s))+'.':'')+'</p>';
}
function imgLink(q){return "https://www.google.com/search?tbm=isch&q="+encodeURIComponent(q+" muscles sollicités");}

/* Programme complet, déroulant */
function peBody(ex,n,sid){
  var h='',m=muscOf(ex.id);
  var r=rx(ex,n,null),u=r.unit==="s"?" s":"";
  if(m) h+=anatBlock(m);
  var k=kindOf(ex,null);
  h+='<div class="pe-rx">';
  if(r.skip) h+='<span>S'+n+' : pas cet exercice cette semaine.</span>';
  else h+='<span><b>S'+n+'</b> : '+(k==="emom"?r.sets+' min × '+r.lo+' / min':r.sets+' × '+(r.lo===r.hi?r.lo:r.lo+'-'+r.hi)+u+(ex.side?' / '+ex.side:''))+' · '+esc(rirFor(ex,n))+'</span>';
  h+='<span>'+esc(ex.tempo)+(ex.restTxt&&k!=="emom"?' · repos '+esc(ex.restTxt):'')+'</span>';
  if(ex.start) h+='<span>Départ : '+esc(ex.start)+'</span>';
  if(ex.up&&k==="std") h+='<span>Progression : '+esc(ex.up)+'</span>';
  h+='</div>';
  if(ex.ss){var o=ALLEX[ex.ss];h+='<p class="ss-note" style="margin:0">Superset avec '+esc(o.label||o.id)+' : tu alternes les deux.</p>';}
  if(ex.cues&&ex.cues.length) h+='<div><h4>Comment faire</h4><ul>'+ex.cues.map(function(c){return '<li>'+esc(c)+'</li>';}).join("")+'</ul></div>';
  if(ex.alts&&ex.alts.length) h+='<div><h4>Variantes</h4><ul class="pe-var">'+ex.alts.map(function(a){return '<li><b>'+esc(a.tag)+'</b> · '+esc(a.name)+(a.start?' ('+esc(a.start)+')':'')+(a.cues&&a.cues[0]?'<br><span class="p-mut">'+esc(a.cues[0])+'</span>':'')+'</li>';}).join("")+'</ul></div>';
  h+='<div class="pe-links"><a href="'+yt(ex.q||ex.name)+'" target="_blank" rel="noopener">Démo vidéo</a><a href="'+imgLink(ex.name)+'" target="_blank" rel="noopener">Images en ligne</a></div>';
  return h;
}
function isOpen(key){return !!state.open[key];}
function det(cls,key,summary,body){return '<details class="'+cls+'" data-open="'+key+'"'+(isOpen(key)?' open':'')+'><summary>'+summary+'</summary>'+body+'</details>';}
function warmList(kind){var W=WARM[kind];return det("pw","w-"+kind,'Échauffement · '+W.dur,'<ol class="wlist">'+W.items.map(function(it){return '<li><div class="wi"><span>'+esc(it[0])+'</span><span class="dose">'+esc(it[1])+'</span></div></li>';}).join("")+'</ol>');}
function exSummary(label,name,sub){return '<span class="ex-id">'+esc(label)+'</span><span class="pe-t">'+esc(name)+'<small>'+esc(sub)+'</small></span>';}
function progSession(sid,n){
  var s=S[sid],p=phase(n),body='';
  if(sid==="E"){
    var m=MUSC.E1;
    body+='<div class="pe-body">'+anatBlock(m)+'<div class="pe-rx"><span><b>S'+n+'</b> : '+p.cardio+' min · RPE 3-4 / 10</span><span>Progresse de 35 à 45 min sur l’année</span></div>'+
      '<div><h4>Comment faire</h4><ul><li>Course facile sur terrain plat, en gardant la possibilité de parler en phrases complètes.</li><li>Pendant les blocs : 4 à 6 accélérations progressives de 60 à 80 m à la fin.</li><li>Genou sensible : vélo, VTT ou marche rapide en côte (menu Version dans l’onglet Mer).</li></ul></div>'+
      '<div><h4>Mobilité, 6 min</h4><ul><li>Fente basse, étirement des fléchisseurs de hanche : 2 × 30 s / côté</li><li>Position 90/90 au sol : 1 min</li><li>Rotation thoracique : 8 / côté</li><li>Suspension passive à la barre : 2 × 30 s</li></ul></div></div>';
  } else {
    if(s.warm) body+=warmList(s.warm);
    s.ex.forEach(function(ex){
      var r=rx(ex,n,null),k=kindOf(ex,null),u=r.unit==="s"?" s":"";
      var sub=r.skip?"S"+n+" : pas cette semaine":"S"+n+" : "+(k==="emom"?r.sets+" min × "+r.lo:r.sets+" × "+(r.lo===r.hi?r.lo:r.lo+"-"+r.hi)+u)+(ex.restTxt&&k!=="emom"?" · repos "+ex.restTxt:"");
      body+=det("pe","e-"+ex.id,exSummary(ex.label||ex.id,ex.name,sub),'<div class="pe-body">'+peBody(ex,n,sid)+'</div>');
    });
    if(s.fin){
      var fm=MUSC[s.fin],mins=p.fin;
      body+=det("pe","e-"+s.fin,exSummary(s.fin,"Finisher cardio EMOM",mins?"S"+n+" : "+mins+" min":"S"+n+" : pas de finisher"),
        '<div class="pe-body">'+(fm?anatBlock(fm):'')+'<ul class="emom">'+FIN.base.rows.map(function(r){return '<li><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span></li>';}).join("")+'</ul><div><h4>Comment faire</h4><ul>'+FIN.base.cues.map(function(c){return '<li>'+esc(c)+'</li>';}).join("")+'</ul></div><div><h4>Version genou, sans impact</h4><ul>'+FIN.alt.rows.map(function(r){return '<li>'+esc(r[0])+' : '+esc(r[1])+'</li>';}).join("")+'</ul></div><div class="pe-links"><a href="'+yt("burpees technique")+'" target="_blank" rel="noopener">Démo vidéo</a></div></div>');
    }
    body+='<p class="p-mut" style="margin:2px 4px 0">'+esc(COOL)+'</p>';
  }
  body+='<button type="button" class="pe-open" data-tab="'+sid+'">Ouvrir la séance '+sid+' pour noter mes reps</button>';
  var nEx=s.ex.length,sub=s.day+" · "+(sid==="E"?p.cardio+" min":s.dur)+(nEx?" · "+nEx+" exercices"+(s.fin?" + finisher":""):"");
  return det("ps","s-"+sid,'<span class="ps-code">'+sid+'</span><span class="ps-t"><b>'+esc(s.title)+'</b><small>'+esc(sub)+'</small></span>','<div class="ps-body">'+body+'</div>');
}
function progCard(){
  var n=state.week,h='<section class="card"><h2 class="h2">Le programme</h2><p class="p-mut" style="margin-bottom:12px">Touche une séance, puis un exercice : consigne, variantes et muscles sollicités. Les séries et reps affichées sont celles de la semaine '+n+'.</p><div class="prog">';
  ORDER.forEach(function(sid){h+=progSession(sid,n);});
  h+='<div class="note" style="margin:0"><b>Vendredi</b> : repos actif, 8 000 à 10 000 pas, et 30 min de vélo ou de marche si tu es frais. <b>Dimanche</b> : repos complet.</div>';
  return h+'</div><p class="p-mut" style="margin-top:12px">Les schémas sont dessinés pour cette app (ils marchent hors connexion). Pour des photos et des vidéos, utilise les liens « Images en ligne » et « Démo vidéo ».</p></section>';
}

/* ---------- État ---------- */
var LS_LIVE="carnet62.live", LS_DATA="carnet62.data", LS_SW="carnet62.swaps", LS_CUES="carnet62.cues", LS_CUES2="carnet62.cues2", LS_SWAT="carnet62.swapsAt", LS_UNDO="carnet62.undo";
function lsGet(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var state={week:todayWeek(),tab:initialTab(),weeks:lsGet(LS_DATA)||{},swaps:lsGet(LS_SW)||{},swapsAt:lsGet(LS_SWAT)||{},cues:lsGet(LS_CUES2)===true,open:{},live:lsGet(LS_LIVE)||null};
if(state.tab==="live"&&state.live&&+state.live.week>=FIRST) state.week=+state.live.week; /* reprise : on revient sur la semaine de la séance en cours */
function initialTab(){var h=(location.hash||"").replace("#","");if(TABS.indexOf(h)>=0) return h;var m={1:"A",2:"B",3:"E",4:"C",6:"D"};return m[new Date().getDay()]||"plan";}
function wk(n){var o=state.weeks[n];if(!o){o=state.weeks[n]={week:n};}["ex","done","body","sess","tests"].forEach(function(k){o[k]=o[k]||{};});return o;}
function entry(n,id){var o=state.weeks[n];return (o&&o.ex&&o.ex[id])||{};}
var DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
var DEFAULT_DAY={A:1,B:2,E:3,C:4,D:6};
function dayFor(n,sid){var o=state.weeks[n]||{},x=o.schedule&&+o.schedule[sid];return x>=1&&x<=7?x:DEFAULT_DAY[sid];}
function modeFor(n,sid){var o=state.weeks[n]||{},m=o.modes&&o.modes[sid];return m==="30"||m==="45"?m:"full";}
function sessionEx(sid,n){
 var all=S[sid].ex,mode=modeFor(n,sid);if(mode==="full")return all;
 var picks={
  A:{"30":["A2","A3p","A4"],"45":["A1","A2","A3p","A4","A5","A6"]},
  B:{"30":["B3","B4","B5"],"45":["B1","B3","B4","B5","B6"]},
  C:{"30":["C1","C2","C3"],"45":["C1","C2","C3","C4","C5","C6"]},
  D:{"30":["D2","D3","D4"],"45":["D1","D2","D3","D4","D5"]}
 };
 var ids=picks[sid]&&picks[sid][mode];return ids?all.filter(function(e){return ids.indexOf(e.id)!==-1;}):all;
}
function plannedDays(n){
 var rows=[];for(var i=1;i<=7;i++){
  var sids=ORDER.filter(function(sid){return dayFor(n,sid)===i;});
  if(!sids.length)rows.push([DAYS[i-1],null,i===5?"Repos actif : marche ou vélo facile.":i===7?"Repos complet":"Repos / séance déplacée"]);
  else sids.forEach(function(sid){rows.push([DAYS[i-1],sid]);});
 }return rows;
}

function clone(x){return x==null?x:JSON.parse(JSON.stringify(x));}
function strip(x){if(!x) return null;var c=clone(x);delete c.updatedAt;return c;}
function num(v){if(v==null||v==="") return null;var n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:null;}
function setVals(e){return (e.sets||[]).map(num).filter(function(x){return x!=null;});}
function hasData(e){return !!e&&(setVals(e).length>0||num(e.best)!=null||num(e.total)!=null||num(e.min)!=null||!!e.load);}
function anyData(o){if(!o) return false;for(var k in (o.ex||{})){if(hasData(o.ex[k])) return true;}return !!(o.done&&Object.keys(o.done).length)||!!(o.body&&(o.body.weight||o.body.waist));}
function doneCount(n){var o=state.weeks[n];if(!o||!o.done) return 0;return ORDER.filter(function(k){return !!o.done[k];}).length;}
function curAlt(ex){var k=state.swaps[ex.id];if(!k||!ex.alts) return null;for(var i=0;i<ex.alts.length;i++){if(ex.alts[i].k===k) return ex.alts[i];}return null;}
function kindOf(ex,alt){return (alt&&alt.kind)||ex.kind||"std";}

/* Prescription d'une semaine donnée, pour la version choisie */
function rx(ex,n,alt){
  var p=phase(n), k=kindOf(ex,alt);
  var src=(alt&&alt.rx)?alt.rx:ex;
  var r={sets:src.sets,lo:src.lo,hi:src.hi,unit:src.unit||((alt&&alt.rx)?"reps":ex.unit)||"reps",tag:"",skip:false};
  var useBy=ex.by&&(!alt||!alt.rx||ex.kind==="emom");
  if(useBy){var o=ex.by(p.key,n);if(o){if(o.skip) r.skip=true;["sets","lo","hi","tag"].forEach(function(f){if(o[f]!=null) r[f]=o[f];});}}
  var fixed=(k==="jump"||k==="fixed"||k==="emom")&&useBy;
  if(p.sets&&!fixed&&r.sets) r.sets=Math.min(r.sets,p.sets);
  if(p.noD&&ex.id.charAt(0)==="D") r.skip=true;
  if(k==="jump"&&alt&&!alt.rx){var o2=ex.by(p.key,n);if(o2){r.sets=o2.sets;r.lo=o2.lo;r.hi=o2.hi;}}
  return r;
}
function rirFor(ex,n){var p=phase(n);if(p.light) return p.rir;if(ex.speed) return "vitesse max";if(p.key==="b1end"&&ex.main) return "RIR 1";if(ex.iso&&p.rir.indexOf("1-2")>=0) return "RIR 0-1";return p.rir;}

/* ---------- Enregistrement : uniquement sur ce téléphone (localStorage), rien n'est envoyé ---------- */
var LS_EXP="carnet62.lastExport", pendingRender=false, storeOk=true;
function cacheLocal(){
  try{
    var a=JSON.stringify(state.weeks),b=JSON.stringify(state.swaps);
    localStorage.setItem(LS_SWAT,JSON.stringify(state.swapsAt));
    localStorage.setItem(LS_DATA,a);localStorage.setItem(LS_SW,b);
    storeOk=(localStorage.getItem(LS_DATA)===a&&localStorage.getItem(LS_SW)===b); /* relecture : on vérifie que c'est bien écrit */
  }catch(e){storeOk=false;}
}
var saveT=null, pendSt=[], flashT=null;
function stored(en){return !!en&&(hasData(en)||!!en.note||!!en.km||!!en.rpe);}
function markPending(el){
  var st=el&&el.querySelector?el.querySelector(".log-st"):null;
  if(st){st.dataset.st="busy";st.textContent="Enregistrement…";if(pendSt.indexOf(st)<0) pendSt.push(st);}
}
function scheduleSave(){
  ghSt.dirtyAt=Date.now();
  clearTimeout(saveT);
  saveT=setTimeout(function(){
    cacheLocal();
    pendSt.forEach(function(st){if(!st.isConnected) return;st.dataset.st=storeOk?"ok":"err";st.textContent=storeOk?"✓ Enregistré":"⚠ Non enregistré";});
    pendSt=[];
    flashSync();ghAutoSoon();
  },300);
}
function flashSync(){
  var el=document.getElementById("sync");if(!el) return;
  var d=new Date(),hm=d.getHours()+":"+String(d.getMinutes()).padStart(2,"0");
  el.classList.add("flash");el.dataset.s=storeOk?"ok":"err";
  el.textContent=storeOk?"✓ Enregistré · "+hm:"⚠ Non enregistré : stockage bloqué";
  clearTimeout(flashT);flashT=setTimeout(function(){el.classList.remove("flash");setSync();},3500);
}
function lastExport(){var v=lsGet(LS_EXP);return v?new Date(v):null;}
function daysSince(d){return Math.floor((Date.now()-d.getTime())/864e5);}
function setSync(){
  var el=document.getElementById("sync"),s,t,le=lastExport();
  if(!storeOk){s="err";t="Enregistrement impossible : stockage du navigateur bloqué";}
  else if(gh&&gh.repo&&!gh.token){s="local";t="Synchro en pause : jeton à ressaisir (onglet Plan)";}
  else if(ghOn()){
    if(ghSt.busy){s="busy";t="Synchronisation…";}
    else if(ghSt.err){s=ghSt.kind==="net"?"local":"err";t=ghSt.kind==="net"?"Hors ligne · synchro en attente":"⚠ Synchro : "+ghShort();}
    else if(ghSt.dirtyAt>ghSt.okAt&&ghSt.okAt){s="busy";t="Enregistré · synchro en attente";}
    else if(gh.last){s="ok";t="Synchronisé · "+hm(new Date(gh.last));}
    else {s="busy";t="Synchronisation…";}
  }
  else if(!le){s=anyStored()?"local":"ok";t="Sur ce téléphone · pas encore de sauvegarde";}
  else {var d=daysSince(le);s=d>14?"local":"ok";t="Sur ce téléphone · sauvegarde "+(d===0?"aujourd’hui":d===1?"hier":"il y a "+d+" j");}
  el.dataset.s=s;el.textContent=t;
  var dot=document.getElementById("barDot");if(dot) dot.dataset.s=s;
}
function anyStored(){for(var k in state.weeks){if(+k>=FIRST&&anyData(state.weeks[k])) return true;}return false;}
try{if(navigator.storage&&navigator.storage.persist) navigator.storage.persist();}catch(e){}

/* Sauvegarde et restauration (fichier) */
function stamp(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function stampT(){var d=new Date();return stamp()+"-"+String(d.getHours()).padStart(2,"0")+String(d.getMinutes()).padStart(2,"0");}
function saveFile(name,text,mime){
  var blob=new Blob([text],{type:mime}),isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  try{
    var file=new File([blob],name,{type:mime});
    if(isMobile&&navigator.canShare&&navigator.canShare({files:[file]})){
      return navigator.share({files:[file],title:name}).then(function(){return true;},function(e){return e&&e.name==="AbortError"?false:dl();});
    }
  }catch(e){}
  return Promise.resolve(dl());
  function dl(){var u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove();},1500);return true;}
}
function exportJSON(){
  var data={app:"carnet-v62",format:2,exportedAt:new Date().toISOString(),weeks:state.weeks,swaps:state.swaps,swapsAt:state.swapsAt};
  saveFile("carnet-v62-"+stampT()+".json",JSON.stringify(data,null,1),"application/json").then(function(ok){if(ok){lsSet(LS_EXP,new Date().toISOString());setSync();if(state.tab==="plan") render();}});
}
function csvCell(v){v=v==null?"":String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function forceUpdate(){
  var jobs=[];
  try{if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations) jobs.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister();}));}));}catch(e){}
  try{if(window.caches&&caches.keys) jobs.push(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k);}));}));}catch(e){}
  Promise.all(jobs).catch(function(){}).then(function(){location.replace(location.pathname+"?maj="+Date.now()+(location.hash||""));});
}
function exportCSV(){
  var rows=[["Semaine","Début","Séance","Code","Exercice","Version","Charge","Séries","Total","Meilleur saut (cm)","EMOM (reps)","Minutes","Note"]];
  for(var n=HFIRST;n<=LAST;n++){
    var o=state.weeks[n];if(!o) continue;
    ORDER.forEach(function(sid){
      var list=exAll(sid);if(S[sid].fin) list.push({id:S[sid].fin,name:"Finisher cardio"});if(sid==="E") list=[{id:"E1",name:"Endurance"}];
      list.forEach(function(ex){
        var e=o.ex&&o.ex[ex.id];if(!e||!hasData(e)) return;
        var alt=null;(ex.alts||[]).forEach(function(a){if(a.k===e.v) alt=a;});
        var sv=setVals(e);
        rows.push([wLab(n),fmtD(dOf(n,0)),sid,ex.label||ex.id,alt?alt.name:ex.name,alt?alt.tag:(e.v&&ex.id==="E1"?e.v:"base"),e.load||"",sv.join("/"),sv.length?sum(sv):"",e.best||"",e.total||"",e.min||"",e.note||""]);
      });
    });
    var b=o.body||{},t=o.tests||{};
    if(b.weight||b.waist) rows.push([wLab(n),fmtD(dOf(n,0)),"Mesures","","Poids (kg) / tour de taille (cm)","",b.weight||"",b.waist||"","","","","",""]);
    if(t.pull||t.push||t.jump) rows.push([wLab(n),fmtD(dOf(n,0)),"Tests","","Tractions / pompes / saut","",t.pull||"",t.push||"","",t.jump||"","","",""]);
  }
  var text="﻿"+rows.map(function(r){return r.map(csvCell).join(";");}).join("\r\n");
  saveFile("carnet-v62-"+stamp()+".csv",text,"text/csv");
}
var importing=null;
/* Fusion : pour chaque saisie, on garde la plus récente (horodatage), sans jamais effacer ce qui n'existe que d'un côté */
function atOf(x){return (x&&x.at)||0;}
function filled(o){
  if(!o) return false;
  for(var k in o){
    if(k==="at"||k==="week") continue;
    var v=o[k];
    if(Array.isArray(v)){if(v.some(function(x){return x!==""&&x!=null;})) return true;}
    else if(v&&typeof v==="object"){if(filled(v)) return true;}
    else if(v!==""&&v!=null) return true;
  }
  return false;
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function mergeUnit(a,b,st){
  if(!filled(b)) return a;
  if(!filled(a)){if(!a||!same(a,b)) st.added++;return clone(b);}
  if(same(a,b)) return a;
  var ta=atOf(a),tb=atOf(b);
  if(tb>ta){st.updated++;return clone(b);}
  st.kept++;return a;
}
function mergeMap(la,lb,st){
  var out=la||{};
  for(var k in (lb||{})) out[k]=mergeUnit(out[k],lb[k],st);
  return out;
}
function mergeData(d){
  var st={added:0,updated:0,kept:0},weeks=clone(state.weeks)||{},inW=d.weeks||{};
  Object.keys(inW).forEach(function(k){
    var b=inW[k];if(!b||typeof b!=="object") return;
    var a=weeks[k]||(weeks[k]={week:+k});
    ["ex","sess"].forEach(function(f){a[f]=mergeMap(a[f]||{},b[f],st);});
    ["body","tests"].forEach(function(f){a[f]=mergeUnit(a[f]||{},b[f],st)||{};});
    ["schedule","modes"].forEach(function(f){var at=f==="schedule"?"scheduleAt":"modesAt",ta=a[at]||0,tb=b[at]||0;if(tb>ta){a[f]=clone(b[f]||{});a[at]=tb;}else if(!a[f]&&b[f])a[f]=clone(b[f]);});
    /* séances cochées : la dernière action (cocher ou décocher) l'emporte ; à égalité, on garde les coches */
    a.done=a.done||{};a.doneAt=a.doneAt||{};
    var ids={};Object.keys(a.done).concat(Object.keys(a.doneAt),Object.keys(b.done||{}),Object.keys(b.doneAt||{})).forEach(function(x){ids[x]=1;});
    Object.keys(ids).forEach(function(x){
      var ta=(a.doneAt&&a.doneAt[x])||0,tb=(b.doneAt&&b.doneAt[x])||0,av=a.done[x],bv=(b.done||{})[x];
      var v=tb>ta?bv:(ta>tb?av:(av||bv));
      if(v&&!av) st.added++;
      if(v) a.done[x]=v;else delete a.done[x];
      if(Math.max(ta,tb)) a.doneAt[x]=Math.max(ta,tb);
    });
  });
  /* versions choisies (menu Version) : la plus récente l'emporte */
  var swaps=clone(state.swaps)||{},swAt=clone(state.swapsAt)||{},inS=d.swaps||{},inAt=d.swapsAt||{},ks={};
  Object.keys(swaps).concat(Object.keys(swAt),Object.keys(inS),Object.keys(inAt)).forEach(function(x){ks[x]=1;});
  Object.keys(ks).forEach(function(x){
    var ta=swAt[x]||0,tb=inAt[x]||0;
    if(tb>ta){if(inS[x]) swaps[x]=inS[x];else delete swaps[x];swAt[x]=tb;}
    else if(ta===tb&&!swaps[x]&&inS[x]) swaps[x]=inS[x];
  });
  return {weeks:weeks,swaps:swaps,swapsAt:swAt,stats:st};
}
function readImport(file){
  var fr=new FileReader();
  fr.onload=function(){
    var d=null;try{d=JSON.parse(fr.result);}catch(e){}
    if(!d||d.app!=="carnet-v62"||typeof d.weeks!=="object"||!d.weeks){importing={error:"Ce fichier n’est pas une sauvegarde du carnet. Choisis un fichier « carnet-v62-….json »."};}
    else {var ks=Object.keys(d.weeks).map(Number).filter(function(n){return n>=HFIRST&&n<=LAST;}).sort(function(a,b){return a-b;}),sess=0;
      ks.forEach(function(n){var o=d.weeks[n];if(o&&o.done) sess+=Object.keys(o.done).length;});
      var ed=d.exportedAt?new Date(d.exportedAt):null;
      var m=null;try{m=mergeData(d);}catch(e){m=null;}
      importing={data:d,merged:m,summary:(ks.length?(ks.length===1?"Semaine "+wLab(ks[0]):"Semaines "+wLab(ks[0])+" à "+wLab(ks[ks.length-1]))+", "+sess+" séance"+(sess>1?"s":"")+" cochée"+(sess>1?"s":""):"Aucune semaine notée")+(ed?", exportée le "+ed.getDate()+" "+MONTHS[ed.getMonth()]+" "+ed.getFullYear()+" à "+ed.getHours()+" h "+String(ed.getMinutes()).padStart(2,"0"):"")};}
    render();
  };
  fr.readAsText(file);
}
function applyImport(mode){
  if(!importing||!importing.data) return;
  lsSet(LS_UNDO,{at:Date.now(),weeks:state.weeks,swaps:state.swaps,swapsAt:state.swapsAt});
  var d=importing.data;
  if(mode==="merge"&&importing.merged){state.weeks=importing.merged.weeks;state.swaps=importing.merged.swaps;state.swapsAt=importing.merged.swapsAt;}
  else {state.weeks=d.weeks||{};state.swaps=d.swaps||{};state.swapsAt=d.swapsAt||{};}
  importing=null;ensureHistory();cacheLocal();render();flashSync();
}
function undoImport(){
  var u=lsGet(LS_UNDO);if(!u) return;
  state.weeks=u.weeks||{};state.swaps=u.swaps||{};state.swapsAt=u.swapsAt||{};
  try{localStorage.removeItem(LS_UNDO);}catch(e){}
  importing=null;cacheLocal();render();flashSync();
}
/* ---------- Synchronisation automatique entre appareils (dépôt GitHub privé) ---------- */
/* Le jeton GitHub est gardé uniquement dans sessionStorage (et jamais exporté). */
var LS_GH="carnet62.gh", GH_FILE="carnet-v62.json", GH_API="https://api.github.com";
var ghStored=lsGet(LS_GH)||null,ghToken="";
try{ghToken=sessionStorage.getItem(LS_GH+".token")||(ghStored&&ghStored.token)||"";
 if(ghToken)sessionStorage.setItem(LS_GH+".token",ghToken);
}catch(e){ghToken=(ghStored&&ghStored.token)||"";}
var gh=ghStored?{repo:ghStored.repo,token:ghToken,sha:ghStored.sha||null,last:ghStored.last||null}:null;
if(ghStored&&ghStored.token)lsSet(LS_GH,{repo:ghStored.repo,sha:ghStored.sha||null,last:ghStored.last||null});
var ghSt={busy:false,err:"",kind:"",msg:"",again:false,dirtyAt:0,okAt:0,lastTry:0,tryRepo:""}, ghT=null;
function ghOn(){return !!(gh&&gh.token&&gh.repo);}
function ghSave(){
 try{if(gh&&gh.token)sessionStorage.setItem(LS_GH+".token",gh.token);
 else sessionStorage.removeItem(LS_GH+".token");}catch(e){}
 if(gh)lsSet(LS_GH,{repo:gh.repo,sha:gh.sha||null,last:gh.last||null});
 else{try{localStorage.removeItem(LS_GH);}catch(e){}}
}
/* JSON à clés triées : deux appareils qui ont les mêmes données produisent exactement le même texte (pas d'envoi inutile) */
function canon(v){
  if(Array.isArray(v)){var a=[];for(var i=0;i<v.length;i++) a.push(canon(v[i]===undefined?null:v[i]));return "["+a.join(",")+"]";}
  if(v&&typeof v==="object") return "{"+Object.keys(v).filter(function(k){return v[k]!==undefined;}).sort().map(function(k){return JSON.stringify(k)+":"+canon(v[k]);}).join(",")+"}";
  return JSON.stringify(v==null?null:v);
}
function b64enc(s){var by=new TextEncoder().encode(s),bin="";for(var i=0;i<by.length;i+=8192) bin+=String.fromCharCode.apply(null,by.subarray(i,i+8192));return btoa(bin);}
function b64dec(b){var bin=atob(b.replace(/\s/g,"")),by=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++) by[i]=bin.charCodeAt(i);return new TextDecoder().decode(by);}
function ghFetch(method,path,body,raw){
  var h={"Authorization":"Bearer "+gh.token,"Accept":raw?"application/vnd.github.raw+json":"application/vnd.github+json"};
  var o={method:method,headers:h,cache:"no-store"};
  if(body){h["Content-Type"]="application/json";o.body=JSON.stringify(body);}
  return fetch(GH_API+path,o).then(function(r){
    return r.text().then(function(t){var j=null;if(!raw){try{j=JSON.parse(t);}catch(e){}}return {status:r.status,ok:r.ok,json:j,text:t,rl:r.headers.get("x-ratelimit-remaining")};});
  });
}
function ghFail(e){
  var r=e&&e.gh,m=(r&&r.json&&r.json.message)||"";
  if(r){
    if(r.status===401){ghSt.kind="auth";ghSt.err="Jeton refusé ou expiré. Crée-en un nouveau (étapes ci-dessous) et reconnecte cet appareil.";}
    else if((r.status===403||r.status===429)&&r.rl==="0"){ghSt.kind="rate";ghSt.err="Limite de requêtes GitHub atteinte. Ça reprendra tout seul d’ici une heure maximum.";}
    else if(r.status===403){ghSt.kind="auth";ghSt.err="Accès refusé : le jeton doit avoir la permission « Contents » en lecture et écriture sur le dépôt « "+(gh?gh.repo:ghSt.tryRepo)+" ».";}
    else if(r.status===404){ghSt.kind="repo";ghSt.err="Dépôt « "+(gh?gh.repo:ghSt.tryRepo)+" » introuvable, ou jeton sans accès à ce dépôt. Vérifie le nom, et que le jeton a bien été limité à ce dépôt.";}
    else if(r.status===409&&/empty/i.test(m)){ghSt.kind="repo";ghSt.err="Le dépôt est vide. Sur GitHub, ouvre-le et clique « creating a new file » (ou « Add a README »), valide, puis réessaie.";}
    else {ghSt.kind="other";ghSt.err="GitHub a répondu "+r.status+(m?" : "+m:"")+".";}
  } else if(e&&e.msg){ghSt.kind="other";ghSt.err=e.msg;}
  else if(e instanceof TypeError){ghSt.kind="net";ghSt.err="Pas de connexion à GitHub. Tes données restent enregistrées ici, l’envoi reprendra tout seul.";}
  else {ghSt.kind="other";ghSt.err="Erreur de synchronisation : "+((e&&e.message)||e)+".";}
}
function ghShort(){return {auth:"jeton refusé",repo:"dépôt introuvable",net:"hors connexion",rate:"limite atteinte"}[ghSt.kind]||"erreur";}
/* Lit le fichier du dépôt → {data|null, sha|null} */
function ghPull(){
  var path="/repos/"+gh.repo+"/contents/"+GH_FILE;
  return ghFetch("GET",path).then(function(r){
    if(r.status===404){
      return ghFetch("GET","/repos/"+gh.repo).then(function(q){if(!q.ok) throw {gh:q};return {data:null,sha:null};});
    }
    if(!r.ok) throw {gh:r};
    var j=r.json||{},sha=j.sha||null;
    var p=(j.encoding==="base64"&&j.content)?Promise.resolve(b64dec(j.content)):ghFetch("GET",path,null,true).then(function(q){if(!q.ok) throw {gh:q};return q.text;});
    return p.then(function(t){
      if(!String(t).trim()) return {data:null,sha:sha};
      var d=null;try{d=JSON.parse(t);}catch(e){}
      if(!d||d.app!=="carnet-v62"||typeof d.weeks!=="object"||!d.weeks) throw {msg:"Le fichier « "+GH_FILE+" » du dépôt n’est pas un carnet valide. Je n’y touche pas : ouvre le dépôt sur GitHub et supprime ce fichier, ou vérifie que c’est le bon dépôt."};
      return {data:d,sha:sha};
    });
  });
}
/* Un tour complet : lire, fusionner dans l'app, renvoyer si besoin */
function ghRound(tries){
  return ghPull().then(function(rem){
    var changed=false;
    if(rem.data){
      var m=mergeData(rem.data);
      if(canon({w:m.weeks,s:m.swaps,a:m.swapsAt})!==canon({w:state.weeks,s:state.swaps,a:state.swapsAt})){
        state.weeks=m.weeks;state.swaps=m.swaps;state.swapsAt=m.swapsAt;ensureHistory();cacheLocal();changed=true;
      }
    }
    var built=Date.now(),core={app:"carnet-v62",format:2,weeks:state.weeks,swaps:state.swaps,swapsAt:state.swapsAt};
    var mine=canon(core),theirs=rem.data?canon({app:"carnet-v62",format:2,weeks:rem.data.weeks||{},swaps:rem.data.swaps||{},swapsAt:rem.data.swapsAt||{}}):null;
    if(mine===theirs) return {pushed:false,changed:changed,built:built,sha:rem.sha};
    core.exportedAt=new Date().toISOString();
    var req={message:"Carnet "+stampT(),content:b64enc(canon(core))};
    if(rem.sha) req.sha=rem.sha;
    return ghFetch("PUT","/repos/"+gh.repo+"/contents/"+GH_FILE,req).then(function(r){
      if(r.ok) return {pushed:true,changed:changed,built:built,sha:r.json&&r.json.content&&r.json.content.sha};
      if((r.status===409||r.status===422)&&!/empty/i.test((r.json&&r.json.message)||"")){
        if(tries<3) return ghRound(tries+1); /* quelqu'un a écrit entre-temps : on relit et on refusionne */
      }
      throw {gh:r};
    });
  });
}
function ghSync(manual){
  if(!ghOn()) return Promise.resolve();
  if(ghSt.busy){ghSt.again=true;return Promise.resolve();}
  if(!manual&&navigator.onLine===false) return Promise.resolve();
  clearTimeout(ghT);ghSt.busy=true;ghSt.lastTry=Date.now();ghSt.err="";ghUI();
  return ghRound(0).then(function(res){
    if(res.sha) gh.sha=res.sha;
    gh.last=new Date().toISOString();ghSave();ghSt.err="";ghSt.kind="";ghSt.okAt=res.built;
    ghSt.msg=res.pushed&&res.changed?"Données reçues de tes autres appareils et envoyées.":res.pushed?"Données envoyées.":res.changed?"Données reçues de tes autres appareils.":"Déjà à jour, rien de nouveau.";
    if(res.changed) requestRender();
  },function(e){ghFail(e);}).then(function(){
    ghSt.busy=false;ghUI();
    if(ghSt.again||(!ghSt.err&&ghSt.dirtyAt>ghSt.okAt)){ghSt.again=false;ghAutoSoon(1500);}
    else if(ghSt.err&&ghSt.kind==="net"&&ghSt.dirtyAt>ghSt.okAt) ghAutoSoon(60000);
  });
}
function ghAutoSoon(ms){if(!ghOn()) return;clearTimeout(ghT);ghT=setTimeout(function(){ghSync(false);},ms==null?6000:ms);}
function ghConnect(){
  var re=document.getElementById("gh-repo"),te=document.getElementById("gh-tok");
  var repo=((re&&re.value)||"").trim().replace(/^https?:\/\/github\.com\//i,"").replace(/\.git$/i,"").replace(/\/+$/,""),tok=((te&&te.value)||"").trim();
  ghSt.tryRepo=repo||ghSt.tryRepo;
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){ghSt.err="Écris le dépôt sous la forme « compte/Synchro ».";ghSt.kind="other";ghUI();return;}
  if(tok.length<20){ghSt.err="Colle le jeton en entier (il commence par « github_pat_ »).";ghSt.kind="other";ghUI();return;}
  gh={repo:repo,token:tok,sha:null,last:null};ghSave();ghSt.err="";
  ghSync(true).then(function(){if(ghSt.err&&!gh.last){gh=null;ghSave();ghUI();}});
}
function ghDisconnect(){gh=null;ghSave();ghSt.err="";ghSt.msg="";clearTimeout(ghT);ghUI();}
function ghUI(){
  setSync();
  var c=document.getElementById("ghcard");if(!c) return;
  var a=document.activeElement;if(a&&c.contains(a)&&a.tagName==="INPUT") return;
  var t=document.createElement("div");t.innerHTML=ghCard();c.replaceWith(t.firstChild);
}
function hm(d){return d.getHours()+" h "+String(d.getMinutes()).padStart(2,"0");}
function ghCard(){
  var h='<section class="card" id="ghcard"><h2 class="h2">Synchronisation entre appareils</h2>';
  if(ghOn()){
    var l=gh.last?new Date(gh.last):null;
    h+='<p class="p-mut" style="margin-bottom:10px">Active sur cet appareil. Chaque saisie part toute seule vers ton dépôt privé <b>'+esc(gh.repo)+'</b> quelques secondes plus tard, et ce que tu as noté sur tes autres appareils arrive quand tu ouvres l’app. Si la même saisie a été modifiée des deux côtés, la plus récente l’emporte ; rien d’autre n’est effacé.</p>';
    h+='<p style="margin:0 0 12px;font-size:14px">Dernière synchro : <b>'+(l?fmtD(l)+" à "+hm(l):"pas encore")+'</b>'+(ghSt.busy?' · en cours…':'')+'</p>';
    if(ghSt.err) h+='<p class="note warn" style="margin-bottom:12px" role="alert">'+esc(ghSt.err)+'</p>';
    else if(ghSt.msg&&!ghSt.busy) h+='<p class="note plain" style="margin-bottom:12px">✓ '+esc(ghSt.msg)+'</p>';
    h+='<div class="s-tools"><button type="button" class="chk on" data-act="gh-sync"'+(ghSt.busy?' disabled':'')+'>Synchroniser maintenant</button><button type="button" class="ghost" data-act="gh-off">Déconnecter cet appareil</button></div>';
    h+='<p class="p-mut" style="margin-top:12px">« Déconnecter » ne supprime aucune donnée : cet appareil arrête seulement d’envoyer et de recevoir, et oublie le jeton.</p>';
  } else {
    if(gh&&gh.repo) h+='<p class="note warn" style="margin-bottom:12px" role="alert">La synchro est en pause : le jeton n’est gardé que pendant la session du navigateur. Ressaisis-le pour reprendre. Tes données locales sont intactes.</p>';
    h+='<p class="p-mut" style="margin-bottom:12px">Sans ça, les données restent sur l’appareil où tu les notes. Ici, elles sont copiées automatiquement dans un dépôt GitHub <b>privé</b> à toi, et chaque appareil connecté les retrouve. Tu fais la configuration une fois par appareil.</p>';
    if(ghSt.err) h+='<p class="note warn" style="margin-bottom:12px" role="alert">'+esc(ghSt.err)+'</p>';
    h+='<div style="display:grid;gap:10px;margin-bottom:12px"><label class="fld"><span>Dépôt (compte/nom)</span><input class="in" id="gh-repo" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(ghSt.tryRepo||(ghStored&&ghStored.repo)||"jb9065001-prog/Synchro")+'"></label>';
    h+='<label class="fld"><span>Jeton d’accès</span><input class="in" id="gh-tok" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…"></label></div>';
    h+='<div class="s-tools"><button type="button" class="chk on" data-act="gh-on"'+(ghSt.busy?' disabled':'')+'>'+(ghSt.busy?'Connexion…':'Connecter et synchroniser')+'</button></div>';
    h+='<details class="warm" style="margin-top:14px"'+(isOpen("gh-help")?" open":"")+' data-open="gh-help"><summary>Comment créer le jeton (2 minutes)</summary><ol class="wlist">'+
      '<li><div class="wi"><span>Sur github.com (connecté) : ta photo en haut à droite → <b>Settings</b> → tout en bas à gauche <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</span></div></li>'+
      '<li><div class="wi"><span><b>Token name</b> : Carnet. <b>Expiration</b> : 90 jours ou moins. <b>Repository access</b> : <b>Only select repositories</b>, puis choisis uniquement <b>Synchro</b>.</span></div></li>'+
      '<li><div class="wi"><span><b>Permissions</b> → <b>Repository permissions</b> → <b>Contents</b> : <b>Read and write</b>. Rien d’autre.</span></div></li>'+
      '<li><div class="wi"><span><b>Generate token</b>, copie le texte qui commence par <b>github_pat_</b> (il ne s’affiche qu’une fois) et colle-le ci-dessus. Pour les autres appareils, utilise un jeton distinct.</span></div></li></ol>'+
      '<p class="p-mut" style="margin-top:10px">Le jeton ne donne accès qu’à ce dépôt. Il reste dans la session de cet onglet et n’apparaît jamais dans les sauvegardes. Tu devras le ressaisir après fermeture de cette session. Si le dépôt est vide, ajoute-y un fichier README depuis GitHub avant de connecter.</p></details>';
  }
  return h+'</section>';
}

function dataCard(){
  var le=lastExport(),u=lsGet(LS_UNDO);
  var h='<section class="card" id="data"><h2 class="h2">Tes données</h2>';
  h+=ghOn()?'<p class="p-mut" style="margin-bottom:10px">Tout est enregistré dans ce navigateur, et une copie est synchronisée avec ton dépôt privé GitHub (carte ci-dessus). Une sauvegarde en fichier reste utile en secours, par exemple avant de changer de téléphone.</p>':'<p class="p-mut" style="margin-bottom:10px">Tout est enregistré uniquement sur cet appareil, dans ce navigateur. Rien n’est envoyé nulle part tant que tu n’as pas activé la synchronisation (carte ci-dessus). Exporte une sauvegarde de temps en temps : c’est elle qui te permet de tout récupérer si tu changes de téléphone ou si les données du navigateur sont effacées.</p>';
  h+='<p style="margin:0 0 12px;font-size:14px">Dernière sauvegarde : <b>'+(le?fmtD(le)+" "+le.getFullYear()+" à "+le.getHours()+" h "+String(le.getMinutes()).padStart(2,"0"):"jamais")+'</b></p>';
  h+='<div class="s-tools"><button type="button" class="chk" data-act="export">Exporter une sauvegarde</button><label class="ghost" for="imp" style="cursor:pointer">Importer une sauvegarde</label><button type="button" class="ghost" data-act="csv">Exporter en tableur (CSV)</button><button type="button" class="ghost" data-act="upd">Mettre à jour l’app</button><input type="file" id="imp" accept=".json,application/json" hidden></div>';
  if(importing){
    if(importing.error) h+='<p class="note warn" style="margin-top:12px">'+esc(importing.error)+' <button type="button" class="ghost" data-act="imp-cancel">Fermer</button></p>';
    else {
      var m=importing.merged,st=m&&m.stats;
      h+='<div class="note plain" style="margin-top:12px;display:grid;gap:10px"><span>Sauvegarde trouvée : '+esc(importing.summary)+'.</span>';
      if(m) h+='<span><b>Fusionner</b> garde le plus récent de chaque exercice, sans rien effacer : <b>'+st.added+'</b> ajout'+(st.added>1?'s':'')+', <b>'+st.updated+'</b> mise'+(st.updated>1?'s':'')+' à jour, <b>'+st.kept+'</b> saisie'+(st.kept>1?'s':'')+' de cet appareil conservée'+(st.kept>1?'s':'')+' (plus récente'+(st.kept>1?'s':'')+').</span>';
      h+='<div class="s-tools">'+(m?'<button type="button" class="chk on" data-act="imp-merge">Fusionner (conseillé)</button>':'')+'<button type="button" class="ghost" data-act="imp-replace">Tout remplacer</button><button type="button" class="ghost" data-act="imp-cancel">Annuler</button></div>'+
        '<span class="p-mut">« Tout remplacer » efface les données de cet appareil au profit de la sauvegarde. Dans les deux cas, tu pourras annuler juste après.</span></div>';
    }
  }
  if(u&&!importing) h+='<p class="p-mut" style="margin-top:12px">Dernière importation : '+fmtD(new Date(u.at))+' à '+new Date(u.at).getHours()+' h '+String(new Date(u.at).getMinutes()).padStart(2,"0")+'. <button type="button" class="ghost" data-act="undo" style="padding:4px 10px">Annuler cette importation</button></p>';
  h+='<p class="p-mut" style="margin-top:12px">Version de l’app : <b>b'+BUILD+'</b> ('+BUILD_DATE+'). Si une nouveauté n’apparaît pas après une mise en ligne, touche « Mettre à jour l’app » : elle vide le cache de l’app, pas tes données.</p>';
  h+='<details class="warm" style="margin-top:14px"'+(isOpen("sync-help")?" open":"")+' data-open="sync-help"><summary>Passer d’un appareil à l’autre (kDrive, etc.)</summary><ol class="wlist"><li><div class="wi"><span>Sur l’appareil où tu as fait la séance : <b>Exporter une sauvegarde</b>. Sur téléphone, choisis kDrive (ou Fichiers) dans la fenêtre de partage.</span></div></li><li><div class="wi"><span>Sur l’autre appareil : <b>Importer une sauvegarde</b>, choisis le fichier dans kDrive, puis <b>Fusionner</b>.</span></div></li><li><div class="wi"><span>Pour que les deux appareils soient à jour, refais l’opération dans l’autre sens.</span></div></li></ol></details>';
  return h+'</section>';
}

/* Hors connexion : l'app se met en cache (fonctionne quand elle est hébergée, ex. GitHub Pages) */
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}

/* ---------- Consignes automatiques (règle de la 1re série) ---------- */
function findPrev(ex,n,v){
  var fb=null;
  for(var k=n-1;k>=HFIRST;k--){
    var e=entry(k,ex.id);
    if(!hasData(e)||(e.v||"")!==v) continue;
    var p=phase(k);
    if(!p.light&&p.key!=="vac") return {n:k,e:e};
    if(!fb) fb={n:k,e:e};
  }
  return fb;
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function advice(ex,n){
  var p=phase(n), alt=curAlt(ex), r=rx(ex,n,alt), k=kindOf(ex,alt), v=alt?alt.k:"";
  var start=(alt&&alt.start)||ex.start, up=(alt&&alt.up)||ex.up||"augmente un peu la difficulté";
  var u=r.unit==="s"?" s":"";
  if(r.skip) return null;
  var prev=findPrev(ex,n,v);
  if(k==="jump"){var b=prev&&num(prev.e.best);return {t:"hold",txt:"Qualité avant tout : arrête dès que la hauteur baisse.",last:b!=null?(wLab(prev.n)+" : meilleur saut "+b+" cm"):""};}
  if(k==="emom"){var tt=prev&&num(prev.e.total);return {t:"hold",txt:"Objectif : "+(r.sets*r.lo)+" reps propres au total, jamais à l’échec.",last:tt!=null?(wLab(prev.n)+" : "+tt+" reps"):""};}
  if(k==="fixed") return {t:"hold",txt:"Volume imposé par la semaine : n’en fais pas plus, même si c’est facile."};
  if(ex.speed&&!(alt&&alt.rx)) return {t:"hold",txt:"Vitesse avant tout : arrête la série dès que ça ralentit. "+cap(up)+"."};
  if(p.light) return {t:"hold",txt:"Semaine allégée : même charge que ta dernière séance, "+r.sets+" séries, sans forcer."};
  if(p.key==="reprise") return {t:"down",txt:"Reprise : environ −10 % par rapport à ta dernière charge de décembre."};
  if(!prev) return {t:"start",txt:"Départ : "+start+"."+(alt?" (version "+alt.tag.toLowerCase()+")":"")};
  var vals=setVals(prev.e), pr=rx(ex,prev.n,alt), res;
  var last=wLab(prev.n)+" : "+(prev.e.load?prev.e.load+" · ":"")+(vals.length?vals.join("/")+u:"—");
  if(!vals.length) return {t:"start",txt:"Départ : "+start+".",last:last};
  if(r.hi<pr.hi) return {t:"up",txt:"Nouveau format ("+r.lo+"-"+r.hi+u+") : ajoute environ 2,5 kg à ta dernière charge.",last:last};
  if(r.hi>pr.hi) return {t:"hold",txt:"Retour au format "+r.lo+"-"+r.hi+u+" : reprends une charge un peu plus légère que la semaine dernière.",last:last};
  var top=ex.lat&&!alt?(vals.length>=2&&vals[0]>=r.hi&&vals[1]>=r.hi):(vals[0]>=r.hi);
  if(top) res={t:"up",txt:(ex.lat&&!alt?"2 premières séries à "+r.hi:"1re série au plafond")+" : tu montes. "+cap(up)+"."};
  else if(vals.some(function(x){return x<r.lo;})) res=vals[0]<r.lo?{t:"down",txt:"1re série sous "+r.lo+u+" : reviens à la charge précédente."}:{t:"down",txt:"Une série sous "+r.lo+u+" : garde la charge et reconstruis les reps."};
  else res={t:"hold",txt:r.unit==="s"?"Même charge : vise +5 s sur la 1re série.":"Même charge : vise +1 rep sur la 1re série."};
  var rir=num(prev.e.rir);
  if(res.t==="up"&&rir!=null&&rir<1){res.t="hold";res.txt="RIR "+rir+" : conserve la charge tant que tu n’as pas une répétition propre en réserve.";}
  var recent=[];
  for(var z=n-1;z>=HFIRST&&recent.length<3;z--){var ze=entry(z,ex.id);if(hasData(ze)&&(ze.v||"")===v&&setVals(ze).length)recent.push(sum(setVals(ze)));}
  if(recent.length>=2)res.txt+=" Tendance : "+recent.slice().reverse().join(" → ")+" reps au total (3 séances maximum).";
  if(res.t==="hold"&&r.unit!=="s"&&vals.length)res.txt+=" Objectif proposé : "+Math.min(r.hi,vals[0]+1)+" reps en 1re série.";
  if(res.t==="up"&&prev.e.load&&r.unit!=="s"){
   var info=loadInfo(prev.e.load),inc=(String(up).match(/\+\s*(\d+(?:[.,]\d+)?)/)||[])[1];
   if(info&&inc){var kg=+inc.replace(",",".");res.txt+=" Charge indicative : "+(info.pair?"2 × "+fmtN(info.per+kg)+" kg":(info.added?"+":"")+fmtN(info.per+kg)+" kg")+" (modifiable).";}
  }
  res.last=last;return res;
}

/* ---------- Rendu ---------- */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function mmss(s){var m=Math.floor(s/60),r=s%60;return m+":"+(r<10?"0":"")+r;}
function yt(q){return "https://www.youtube.com/results?search_query="+encodeURIComponent(q);}
function opts10(v){var h='<option value="">–</option>';for(var i=0;i<=10;i++){h+='<option value="'+i+'"'+(String(v)===String(i)?" selected":"")+'>'+i+'</option>';}return h;}
var main=document.getElementById("main");

function tabHtml(o){return '<button type="button" role="tab" class="tab'+(o.done?" done":"")+'" data-tab="'+o.k+'" aria-selected="'+(state.tab===o.k)+'" style="'+hueStyle(o.kind)+'"><span class="tab-ic">'+ico(o.ic,21,1.9)+'</span><span class="tab-tx"><span class="tab-k">'+esc(o.t)+'</span><span class="tab-l">'+esc(o.l)+'</span></span>'+'<span class="tab-ck">'+ico("check",14,3.2)+'</span></button>';}
function renderHeader(){
  expandWeeks(state.week);
  var n=state.week,p=phase(n);
  document.getElementById("wkTitle").textContent="Semaine "+n;
  document.getElementById("wkSub").textContent=weekRange(n)+" · "+p.name;
  var ph=document.getElementById("wkPhase");ph.textContent=p.chip;ph.className="phase"+(p.light?" light":"");
  document.getElementById("wkPrev").disabled=n<=FIRST;
  document.getElementById("wkNext").disabled=false;
  var o=state.weeks[n],done=(o&&o.done)||{},cur=(n===todayWeek()),tod=DAYN[new Date().getDay()];
  var h='<div class="dr-lab">Cette semaine</div>'+tabHtml({k:"plan",ic:"calendar",kind:"misc",t:"Plan de la semaine",l:weekRange(n)})+tabHtml({k:"live",ic:"dumbbell",kind:"up",t:"Séance en cours",l:"Un exercice à la fois"});
  h+='<div class="dr-lab">Séances</div>';
  ORDER.forEach(function(k){var s=S[k],off=(k==="D"&&p.noD);
    h+=tabHtml({k:k,ic:SESSICON[k],kind:SESSKIND[k],t:s.title,l:(cur&&DAYS[dayFor(n,k)-1]===tod?"Aujourd’hui":DAYS[dayFor(n,k)-1])+" · "+(off?"pas cette semaine":(k==="E"?p.cardio+" min":s.dur.replace("≈ ",""))),done:!!done[k],now:cur&&s.day===tod});});
  h+='<div class="dr-lab">Suivi</div>'+tabHtml({k:"progres",ic:"chart",kind:"misc",t:"Progrès",l:"Graphiques et records"})+tabHtml({k:"regles",ic:"book",kind:"misc",t:"Règles",l:"Lire, progresser, douleur"});
  document.getElementById("tabs").innerHTML=h;
  var t=state.tab;
  document.getElementById("barTitle").textContent=t==="plan"?"Plan de la semaine":t==="live"?"Séance en cours":t==="progres"?"Progrès":t==="regles"?"Règles":S[t].title;
  document.getElementById("barSub").textContent="S"+n+" · "+p.chip+(S[t]?" · "+DAYS[dayFor(n,t)-1]:"");
}

function verSelect(ex){
  if(!ex.alts||!ex.alts.length) return "";
  var cur=state.swaps[ex.id]||"";
  var h='<label class="ver"><span>Version</span><select class="in" id="'+ex.id+'-ver" data-ver="'+ex.id+'"><option value="">Base : '+esc(ex.name)+'</option>';
  ex.alts.forEach(function(a){h+='<option value="'+a.k+'"'+(cur===a.k?" selected":"")+'>'+esc(a.tag)+' → '+esc(a.name)+'</option>';});
  return h+'</select></label>';
}

var IC={
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',
calendar:'<rect x="4" y="5.5" width="16" height="14.5" rx="3.2"/><path d="M4 10.5h16M9 3.5v4M15 3.5v4"/>',
chart:'<path d="M5.5 19.5v-7M12 19.5V5M18.5 19.5v-10"/>',
book:'<path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 1 6 17V4.5z"/><path d="M6 17a2.5 2.5 0 0 1 2.5-2.5H18"/>',
dumbbell:'<path d="M7 7v10M17 7v10M3.8 9.6v4.8M20.2 9.6v4.8M7 12h10"/>',
pull:'<path d="M3.5 4h17"/><path d="M9 4l.8 6M15 4l-.8 6"/><circle cx="12" cy="12.8" r="2.2"/><path d="M12 15v6"/>',
push:'<circle cx="18.6" cy="8.2" r="1.8"/><path d="M16.6 10.6 5.6 15.2M14.2 11.6v8M5.6 15.2v4.3M3 19.7h18"/>',
legs:'<circle cx="12" cy="4.6" r="1.9"/><path d="M12 7.4v5M7.6 9.6h8.8M12 12.4l-4 3.2 1.3 5M12 12.4l4 3.2-1.3 5"/>',
core:'<rect x="7" y="3.5" width="10" height="17" rx="4.5"/><path d="M12 3.5v17M7 9h10M7 14.5h10"/>',
jump:'<path d="M12 18.5V5.5M6.8 10.5 12 5.3l5.2 5.2M5.5 21h13"/>',
stairs:'<path d="M3.5 19.5h5v-5h5v-5h5v-5h2"/>',
flame:'<path d="M12 21c-3.6 0-6-2.5-6-5.8 0-2.4 1.3-4 2.6-5.4C9.8 8.5 10.6 7 10.4 4c2.8 1.4 4.2 3.8 4.3 6 .9-.7 1.4-1.8 1.5-3 1.1 1.7 1.8 3.6 1.8 5.4C18 18.3 15.6 21 12 21z"/>',
foot:'<path d="M9.2 10.4c3.4-.9 6.6 1.2 6.6 5.2 0 3.3-1.5 5.9-4.6 5.9-2.9 0-4.6-2.2-4.6-5.3 0-2.6.8-4.8 2.6-5.8z"/><circle cx="15.9" cy="6.9" r="1.45"/><circle cx="12.4" cy="5.2" r="1.15"/><circle cx="9.3" cy="5.4" r="1"/><circle cx="6.7" cy="7" r=".9"/>',
stretch:'<circle cx="8" cy="5.2" r="1.9"/><path d="M8 8v5.5l-3.5 6.5M8 13.5l5 2.5 6 .5M9.5 9.5l6.5-1.8"/>',
sun:'<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18"/>',
moon:'<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
auto:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.6l2.4 1.6M9.5 3h5"/>',
trophy:'<path d="M8 4.5h8v5a4 4 0 0 1-8 0v-5zM8 6.5H5.2c0 2.6 1 4 3 4.4M16 6.5h2.8c0 2.6-1 4-3 4.4M12 13.5V17M8.5 20h7M9.5 20v-3h5v3"/>',
alert:'<path d="M12 4.2 21 19.5H3L12 4.2zM12 10v4.2M12 16.8v.4"/>'
};
function ico(k,sz,sw){return '<svg class="ic" viewBox="0 0 24 24" width="'+(sz||20)+'" height="'+(sz||20)+'" fill="none" stroke="currentColor" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[k]||"")+'</svg>';}
var SESSKIND={A:"up",C:"up",B:"low",D:"low",E:"cardio"},SESSICON={A:"dumbbell",B:"jump",E:"foot",C:"pull",D:"stairs"};
var EXICON={A1:"push",A2:"pull",A3:"push",A3p:"dumbbell",A4:"pull",A5:"dumbbell",A6:"dumbbell",A7:"core",A8:"flame",B1:"jump",B2:"jump",B3:"legs",B4:"legs",B5:"legs",B5b:"core",B6:"legs",B7:"core",C1:"pull",C2:"pull",C3:"push",C4:"dumbbell",C5:"pull",C6:"dumbbell",C7:"dumbbell",C8:"core",C9:"flame",D1:"legs",D2:"stairs",D3:"legs",D4:"legs",D5:"legs",D6:"legs",D7:"core",E1:"foot",E2:"stretch"};
function hueKind(id){return (id==="A8"||id==="C9"||id.charAt(0)==="E")?"cardio":(SESSKIND[id.charAt(0)]||"misc");}
function hueStyle(kind){var m={up:["--c-up","--c-up-soft"],low:["--c-low","--c-low-soft"],cardio:["--c-cardio","--c-cardio-soft"],misc:["--c-misc","--c-misc-soft"]}[kind]||["--c-misc","--c-misc-soft"];return "--hue:var("+m[0]+");--tint:var("+m[1]+")";}
function exStyle(id){return ' style="'+hueStyle(hueKind(id))+'"';}
function exIc(id){return '<span class="ex-ic" aria-hidden="true">'+ico(EXICON[id]||"dumbbell",20,1.9)+'</span>';}
function exTop(id,label,nameHtml,btn){return '<div class="ex-top">'+exIc(id)+'<div class="ex-ttl"><span class="ex-lab">'+esc(label)+'</span><h3 class="ex-name">'+nameHtml+'</h3></div>'+(btn||"")+'</div>';}
function tech(key,list,foot){return '<details class="tech" data-open="'+key+'"'+((state.cues||isOpen(key))?' open':'')+'><summary>Technique et démo</summary><ul class="cues">'+list.map(function(c){return '<li>'+esc(c)+'</li>';}).join("")+'</ul>'+(foot||'')+'</details>';}
var DAYN=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

/* ---------- Douleur par zone, records ---------- */
var ZONES=["Épaule droite","Épaule gauche","Coude","Poignet","Dos","Nuque","Hanche","Genou","Cheville","Autre"];
function painHistory(){
  var out=[];
  for(var n=FIRST;n<=LAST;n++){var o=state.weeks[n];if(!o||!o.sess) continue;
    ORDER.forEach(function(sid){var q=o.sess[sid];if(!q) return;var p=num(q.pain);if(p==null||!q.zone) return;out.push({n:n,sid:sid,pain:p,zone:q.zone,where:q.where||""});});}
  return out;
}
function painAlerts(){
  var h=painHistory(),last={},prev={},out=[],cur=todayWeek();
  h.forEach(function(e){prev[e.zone]=last[e.zone];last[e.zone]=e;});
  Object.keys(last).forEach(function(z){var l=last[z];if(l.pain>3&&l.n>=cur-1) out.push({z:z,l:l,twice:!!(prev[z]&&prev[z].pain>3)});});
  return out;
}
function painBanner(){
  return painAlerts().map(function(a){var l=a.l,ver=/^Épaule/.test(a.z)?"« Épaule »":/^Genou/.test(a.z)?"« Genou »":"adaptée";
    return '<div class="alertbox" role="note">'+ico("alert",20,1.9)+'<div><b>'+esc(a.z)+' : '+l.pain+'/10</b> <span>à ta dernière séance notée ('+wLab(l.n)+' · '+l.sid+(l.where?', '+esc(l.where):'')+'). Au-delà de 3/10, passe les exercices concernés sur leur version '+ver+' (menu Version).'+(a.twice?' Deux séances de suite au-dessus de 3/10 : si ça dure 2 à 3 semaines, vois un kiné ou un médecin du sport.':'')+'</span></div></div>';}).join("");
}
function painZonesBlock(){
  var z={};painHistory().forEach(function(e){var o=z[e.zone]||(z[e.zone]={n:0,max:0,last:null,over:0});o.n++;o.max=Math.max(o.max,e.pain);o.last=e;if(e.pain>3) o.over++;});
  var keys=Object.keys(z),head='<div class="viz-h"><span class="viz-t">Douleur par zone</span><span class="viz-s">séances où une zone est notée</span></div>';
  if(!keys.length) return '<div class="viz">'+head+'<div class="viz-empty">Choisis la zone dans « Après la séance » : tu verras ici où ça tire, et si ça dure.</div></div>';
  keys.sort(function(a,b){return z[b].max-z[a].max;});
  return '<div class="viz">'+head+'<div class="tbl-wrap" style="margin-top:4px"><table class="tbl"><thead><tr><th>Zone</th><th>Dernière</th><th>Max</th><th>Au-dessus de 3</th></tr></thead><tbody>'+keys.map(function(k){var o=z[k];return '<tr><td>'+esc(k)+'</td><td>'+o.last.pain+'/10 · '+wLab(o.last.n)+'</td><td>'+o.max+'/10</td><td>'+o.over+' / '+o.n+'</td></tr>';}).join("")+'</tbody></table></div></div>';
}
function est1rm(load,reps){return (load>0&&reps>0&&reps<=20)?load*(1+reps/30):null;}
function prInfo(ex,n,alt){
  if(kindOf(ex,alt)!=="std") return null;
  if(((alt&&alt.rx&&alt.rx.unit)||ex.unit)==="s") return null;
  var noLoad=(alt&&alt.noLoad!=null)?alt.noLoad:ex.noLoad;if(noLoad) return null;
  var v=alt?alt.k:"",e=entry(n,ex.id);if(!hasData(e)||(e.v||"")!==v) return null;
  var cur=est1rm(estimateLoad(ex,e,n),setVals(e)[0]);if(cur==null) return null;
  var best=null;
  for(var w=HFIRST;w<n;w++){var pe=entry(w,ex.id);if(!hasData(pe)||(pe.v||"")!==v) continue;var pv=est1rm(estimateLoad(ex,pe,w),setVals(pe)[0]);if(pv!=null&&(best==null||pv>best)) best=pv;}
  cur=Math.round(cur*10)/10;if(best==null) return null;best=Math.round(best*10)/10;
  return cur>best?{cur:cur,prev:best}:null;
}
function prHtml(pr){return ico("trophy",18,1.9)+'<span>Record : 1RM estimé '+fmtN(pr.cur)+' kg <span style="font-weight:500">(avant : '+fmtN(pr.prev)+' kg)</span></span>';}
function refreshPR(card,n,id){var ex=ALLEX[id],el=card.querySelector("[data-pr]");if(!ex||!el) return;var pr=prInfo(ex,n,curAlt(ex));if(pr){el.innerHTML=prHtml(pr);el.hidden=false;}else{el.hidden=true;el.innerHTML="";}}
function recordsCard(){
  var rows=[];
  ORDER.forEach(function(sid){exAll(sid).forEach(function(ex){
    [null].concat(ex.alts||[]).forEach(function(alt){
      if(kindOf(ex,alt)!=="std") return;
      var noLoad=(alt&&alt.noLoad!=null)?alt.noLoad:ex.noLoad;if(noLoad) return;
      if(((alt&&alt.rx&&alt.rx.unit)||ex.unit)==="s") return;
      var v=alt?alt.k:"",best=null,bw=null;
      for(var w=HFIRST;w<=LAST;w++){var e=entry(w,ex.id);if(!hasData(e)||(e.v||"")!==v) continue;var c=est1rm(estimateLoad(ex,e,w),setVals(e)[0]);if(c!=null&&(best==null||c>=best)){best=c;bw=w;}}
      if(best!=null) rows.push({ex:ex,name:alt?alt.name:ex.name,est:best,w:bw});
    });
  });});
  rows.sort(function(a,b){return b.w-a.w||b.est-a.est;});
  var h='<section class="card stack" style="order:5"><h2 class="h2" style="margin:0">Records</h2>';
  if(!rows.length) return h+'<p class="p-mut">Note une charge et ta 1re série : ton meilleur 1RM estimé de chaque exercice apparaîtra ici.</p></section>';
  h+='<div class="recs">'+rows.slice(0,12).map(function(r){return '<div class="rec"'+exStyle(r.ex.id)+'>'+exIc(r.ex.id)+'<div><b>'+esc(r.name)+'</b><small>record en '+wLab(r.w)+'</small></div><em>'+fmtN(Math.round(r.est*10)/10)+' kg</em></div>';}).join("")+'</div>';
  return h+'<p class="p-mut">1RM estimé : formule d’Epley sur la 1re série (charge × (1 + reps ÷ 30)). Lest : estimation sur poids du corps + charge ajoutée si une mesure de poids est enregistrée. Deux haltères : charge totale. Indicateur approximatif, pas une mesure réelle de force maximale.</p></section>';
}
function pushPull(n){
  var pl={a:0,b:0},dn={a:0,b:0};
  ORDER.forEach(function(sid){exAll(sid).forEach(function(ex){
    var alt=curAlt(ex),k=kindOf(ex,alt);if(k!=="std") return;
    var m=muscOf(ex.id,alt?alt.k:"");if(!m) return;
    var hasP=function(g){return m.p.indexOf(g)>=0;};
    var side=(hasP("pecs")||hasP("triceps")||hasP("delt_a"))?"a":(hasP("lats")||hasP("rhomb")||hasP("delt_p")||hasP("biceps"))?"b":null;if(!side) return;
    var r=rx(ex,n,alt);if(r.skip) return;
    pl[side]+=r.sets||0;dn[side]+=setVals(entry(n,ex.id)).filter(function(v){return v>0;}).length;
  });});
  var tot=pl.a+pl.b;if(!tot) return "";
  var msg=pl.b>=pl.a?"Le tirage dépasse la poussée : c’est le bon sens pour protéger les épaules.":"Il y a plus de poussée que de tirage : ajoute des séries de tirage (rowing, face pull) avant d’ajouter de la poussée.";
  return '<div class="viz"><div class="viz-h"><span class="viz-t">Poussée et tirage · S'+n+'</span><span class="viz-s">séries prévues</span></div><div class="pp"><div class="pp-bar" role="img" aria-label="Poussée '+pl.a+', tirage '+pl.b+'"><i class="a" style="width:'+Math.round(100*pl.a/tot)+'%"></i><i class="b" style="width:'+Math.round(100*pl.b/tot)+'%"></i></div><div class="pp-leg"><span>Poussée <b>'+pl.a+'</b></span><span>Tirage <b>'+pl.b+'</b></span></div><p class="pp-txt">'+msg+' Fait cette semaine : '+dn.a+' poussée, '+dn.b+' tirage. L’EMOM de tractions n’est pas compté.</p></div></div>';
}
var CLOCK='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.6l2.4 1.6M9.5 3h5"/></svg>';
function logHead(en,lab){var ok=stored(en);return '<span class="log-h"><span>'+esc(lab||"Ce que tu as fait")+'</span><span class="log-st" aria-live="polite" data-st="'+(ok?"ok":"")+'">'+(ok?"✓ Enregistré":"")+'</span></span>';}

function exCard(ex,n){
  var alt=curAlt(ex), r=rx(ex,n,alt), k=kindOf(ex,alt), en=entry(n,ex.id), u=r.unit==="s"?" s":"";
  var label=ex.label||ex.id, name=alt?alt.name:ex.name;
  var restS=ex.rest||0;
  if(r.skip){
    return '<article class="ex skip"><div class="ex-top"><span class="ex-id">'+label+'</span><h3 class="ex-name">'+esc(name)+'</h3></div><p class="p-mut">Pas cette semaine.</p></article>';
  }
  var a=advice(ex,n), h='<article class="ex"'+exStyle(ex.id)+' data-ex="'+ex.id+'" data-w="'+n+'">';
  var btn="";
  if(k==="emom") btn='<button class="rest" type="button" data-rest="'+(r.sets*60)+'" data-emom="1" data-label="'+esc(label+" · EMOM "+r.sets+" min")+'" aria-label="Lancer le chrono de '+r.sets+' min">'+CLOCK+r.sets+':00</button>';
  else if(restS) btn='<button class="rest" type="button" data-rest="'+restS+'" data-label="'+esc(label+" · "+name)+'" aria-label="Lancer le repos de '+mmss(restS)+'">'+CLOCK+mmss(restS)+'</button>';
  h+=exTop(ex.id,label,esc(name)+(alt?'<small>Variante · '+esc(alt.tag)+'</small>':''),btn);
  var big=k==="emom"?(r.sets+' min × '+r.lo+' / min'):(r.sets+' × '+(r.lo===r.hi?r.lo:r.lo+'-'+r.hi)+u+(ex.side?' / '+ex.side:''));
  h+='<div class="rx"><span class="big">'+big+'</span><span>'+rirFor(ex,n)+'</span><span>'+esc((alt&&alt.tempo)||ex.tempo)+'</span>'+(ex.restTxt&&k!=="emom"?'<span class="mut">repos '+esc(ex.restTxt)+'</span>':'')+(r.tag?'<span class="mut">'+esc(r.tag)+'</span>':'')+'</div>';
  if(ex.ss&&sessionEx(ex.id.charAt(0),n).some(function(e){return e.id===ex.ss;})){var o=ALLEX[ex.ss];h+='<p class="ss-note"><b>Superset avec '+esc(o.label||o.id)+'</b> : tu alternes les deux, avec le repos indiqué après chacun.</p>';}
  if(a) h+='<div class="adv" data-t="'+a.t+'"><span>'+esc(a.txt)+'</span>'+(a.last?'<span class="last">Dernière fois · '+esc(a.last)+'</span>':'')+'</div>';
  var pri=prInfo(ex,n,alt);h+='<div class="pr" data-pr'+(pri?'':' hidden')+'>'+(pri?prHtml(pri):'')+'</div>';
  /* Saisie en premier, juste sous la consigne : c'est ce qu'on remplit pendant la séance */
  var prev=findPrev(ex,n,alt?alt.k:""),pe=prev?prev.e:null;
  var labStd=(r.unit==="s"?"Secondes tenues":"Reps faites")+(ex.side?" par "+ex.side:"")+(pe&&k==="std"?" (en gris : "+wLab(prev.n)+")":"");
  h+='<div class="log">'+logHead(en,k==="std"?labStd:"");
  if(k==="std")h+='<label class="fld" style="margin-top:8px"><span>RIR atteint (facultatif)</span><select class="in" data-f="rir" aria-label="Répétitions en réserve constatées"><option value="">Non noté</option>'+[0,1,2,3,4,5].map(function(i){return '<option value="'+i+'"'+(String(en.rir)===String(i)?' selected':'')+'>'+i+'</option>';}).join("")+'</select></label>';
  if(k==="jump"){
    h+='<label class="fld"><span>Meilleur saut (cm)</span><input class="in in-num" id="'+ex.id+'-best" data-f="best" inputmode="decimal" autocomplete="off" value="'+esc(en.best||"")+'"></label>';
  } else if(k==="emom"){
    h+='<label class="fld"><span>Total de reps faites</span><input class="in in-num" id="'+ex.id+'-total" data-f="total" inputmode="decimal" autocomplete="off" value="'+esc(en.total||"")+'"></label>';
  } else {
    /* Une ligne de tableau : la charge puis une case par série. La dernière séance (même version) s'affiche en grisé dans les cases. */
    var noLoad=(alt&&alt.noLoad!=null)?alt.noLoad:ex.noLoad;
    var hdr=noLoad?"":'<span>Charge</span>',row="";
    if(!noLoad){var lph=(pe&&pe.load)?pe.load:((alt&&alt.start)?"ex. "+alt.start:(ex.ph?"ex. "+ex.ph:""));
      row+='<input class="in in-load" id="'+ex.id+'-load" data-f="load" autocomplete="off" aria-label="Charge utilisée" placeholder="'+esc(lph)+'" value="'+esc(en.load||"")+'">';}
    for(var i=0;i<r.sets;i++){var vv=(en.sets&&en.sets[i])||"",pv=(pe&&pe.sets&&pe.sets[i])||"";
      hdr+='<span>'+(i+1)+'</span>';
      row+='<input class="in in-set" id="'+ex.id+'-s'+i+'" data-f="s'+i+'" inputmode="decimal" autocomplete="off" aria-label="Série '+(i+1)+(r.unit==="s"?", secondes":", reps")+'" placeholder="'+esc(pv)+'" value="'+esc(vv)+'">';}
    var cols=(noLoad?"":"minmax(86px,1.6fr) ")+"repeat("+r.sets+",minmax(40px,1fr))";
    h+='<div class="sets'+(noLoad?' nl':'')+'" style="--cols:'+cols+'"><div class="sh" aria-hidden="true">'+hdr+'</div><div class="sr">'+row+'</div></div>';
  }
  h+='</div>';
  var cues=(alt&&alt.cues)||ex.cues||[], up=(alt&&alt.up)||ex.up;
  h+=tech("c-"+ex.id,cues,'<div class="cue-foot"><span>'+(up&&k==="std"?'Progression : '+esc(up):'')+'</span><a href="'+yt(alt?alt.name:ex.q)+'" target="_blank" rel="noopener">Voir une démo</a></div>');
  h+=verSelect(ex);
  var noteF='<label class="fld fld-note"><span>Note</span><input class="in in-note" id="'+ex.id+'-note" data-f="note" autocomplete="off" placeholder="Sensation, réglage, lest utilisé…" value="'+esc(en.note||"")+'"></label>';
  h+=en.note?noteF:'<details class="tech notez" data-open="n-'+ex.id+'"'+(isOpen("n-"+ex.id)?' open':'')+'><summary>Ajouter une note</summary>'+noteF+'</details>';
  return h+'</article>';
}

var FIN={base:{name:"Finisher cardio",rows:[["Minutes impaires","8 burpees avec saut"],["Minutes paires","40 mountain climbers rapides (20 par jambe)"]],cues:["Au début de chaque minute, fais les reps, puis récupère jusqu’à la minute suivante. Le chrono bipe à chaque minute.","Il doit te rester 15 à 20 s de repos par minute. Burpees : passe à 9 puis 10 quand il te reste encore 20 s sur toutes les minutes. Mountain climbers : s’il te reste plus de 25 s, passe à 50.","Burpee : mains au sol, pieds en arrière, pompe, pieds ramenés, saut bras en l’air."]},
  alt:{k:"soft",tag:"Genou, sans impact",name:"Finisher sans impact",rows:[["Minutes impaires","15 swings à l’haltère (16-20 kg)"],["Minutes paires","8 burpees sans saut"]],cues:["Même format EMOM.","Swing : mouvement de hanche, les bras ne tirent pas. Burpee : pas de saut à la fin."]}};
function finCard(id,n){
  var p=phase(n), min=p.fin;
  if(!min) return '<article class="ex skip"><div class="ex-top"><span class="ex-id">'+id+'</span><h3 class="ex-name">Finisher cardio</h3></div><p class="p-mut">Pas de finisher cette semaine.</p></article>';
  var useAlt=state.swaps[id]==="soft", f=useAlt?FIN.alt:FIN.base, en=entry(n,id);
  var h='<article class="ex"'+exStyle(id)+' data-ex="'+id+'" data-w="'+n+'">';
  h+='<div class="ex-top">'+exIc(id)+'<div class="ex-ttl"><span class="ex-lab">'+id+'</span><h3 class="ex-name">'+esc(f.name)+' · EMOM '+min+' min'+(useAlt?'<small>Variante · '+esc(FIN.alt.tag)+'</small>':'')+'</h3></div><button class="rest" type="button" data-rest="'+(min*60)+'" data-emom="1" data-label="'+esc(id+" · EMOM "+min+" min")+'" aria-label="Lancer le chrono de '+min+' min">'+CLOCK+min+':00</button></div>';
  h+='<div class="rx"><span class="big">'+min+' min</span><span>une minute, un exercice, en alternance</span><span class="mut">8 → 10 → 12 min selon le bloc</span></div>';
  h+='<ul class="emom">'+f.rows.map(function(r){return '<li><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span></li>';}).join("")+'</ul>';
  h+=tech("c-"+id,f.cues,'');
  h+='<label class="ver"><span>Version</span><select class="in" id="'+id+'-ver" data-ver="'+id+'"><option value="">Base : burpees + mountain climbers</option><option value="soft"'+(useAlt?" selected":"")+'>Genou, sans impact → swings + burpees sans saut</option></select></label>';
  h+='<div class="log">'+logHead(en)+'<label class="fld"><span>Minutes tenues</span><input class="in in-num" id="'+id+'-min" data-f="min" inputmode="decimal" autocomplete="off" placeholder="'+min+'" value="'+esc(en.min||"")+'"></label>';
  h+='<label class="fld"><span>Difficulté /10</span><select class="in" id="'+id+'-rpe" data-f="rpe">'+opts10(en.rpe)+'</select></label></div></article>';
  return h;
}

function sessFoot(sid,n){
  var s=(state.weeks[n]&&state.weeks[n].sess&&state.weeks[n].sess[sid])||{};
  var h='<section class="card" data-sess="'+sid+'" data-w="'+n+'"><h2 class="h2">Après la séance</h2><div class="meas">';
  h+='<label class="fld"><span>Douleur max /10</span><select class="in" id="'+sid+'-sf-pain" data-sf="pain">'+opts10(s.pain)+'</select></label>';
  h+='<label class="fld"><span>Zone</span><select class="in" id="'+sid+'-sf-zone" data-sf="zone"><option value="">–</option>'+ZONES.map(function(z){return '<option value="'+esc(z)+'"'+(s.zone===z?' selected':'')+'>'+esc(z)+'</option>';}).join("")+'</select></label>';
  h+='<label class="fld fld-grow"><span>Où, sur quel exercice</span><input class="in in-note" id="'+sid+'-sf-where" data-sf="where" autocomplete="off" placeholder="ex. genou gauche, fentes" value="'+esc(s.where||"")+'"></label>';
  h+='<label class="fld"><span>Sommeil (h)</span><input class="in in-num" id="'+sid+'-sf-sleep" data-sf="sleep" inputmode="decimal" autocomplete="off" value="'+esc(s.sleep||"")+'"></label>';
  h+='<label class="fld"><span>Durée (min)</span><input class="in in-num" id="'+sid+'-sf-dur" data-sf="dur" inputmode="decimal" autocomplete="off" value="'+esc(s.dur||"")+'"></label>';
  return h+'</div><p class="p-mut" style="margin-top:10px">Une douleur au-dessus de 3/10, ou qui reste le lendemain : passe l’exercice concerné sur sa version « Genou » ou « Épaule » avec le menu Version.</p></section>';
}

function sessionHead(sid,n){
  var s=S[sid],o=state.weeks[n],done=!!(o&&o.done&&o.done[sid]),p=phase(n);
  var h='<section class="s-head" style="'+hueStyle(SESSKIND[sid])+'"><div class="s-ic" aria-hidden="true">'+ico(SESSICON[sid],28,1.8)+'</div><div><h1 class="s-title">'+esc(s.title)+'</h1><p class="s-meta">Séance '+esc(s.code)+' · '+esc(DAYS[dayFor(n,sid)-1])+' · '+esc(modeFor(n,sid)==="full"?s.dur.replace("≈ ",""):modeFor(n,sid)+" min")+'</p><p class="s-meta s-sub">'+esc(s.sub)+'</p></div></section>';
  h+='<div class="s-tools"><label class="chk'+(done?" on":"")+'"><input type="checkbox" id="done-'+sid+'" data-done="'+sid+'"'+(done?" checked":"")+'> Séance faite</label>';
  if(sid!=="E") h+='<button type="button" class="ghost" data-act="cues">'+(state.cues?"Replier toute la technique":"Déplier toute la technique")+'</button>';
  h+='<button type="button" class="chk" data-live-start="'+sid+'">Démarrer en mode séance</button></div><p class="note'+(p.light?" warn":"")+'"><b>'+esc(p.chip)+'.</b> '+esc(p.txt)+'</p>'+painBanner();
  return h;
}
function warmBlock(kind){var W=WARM[kind];return '<details class="warm" data-open="wm-'+kind+'"'+((state.cues||isOpen("wm-"+kind))?" open":"")+'><summary>Échauffement · '+W.dur+'</summary><ol class="wlist">'+W.items.map(function(it){return '<li><div class="wi"><span>'+esc(it[0])+'</span><span class="dose">'+esc(it[1])+'</span></div></li>';}).join("")+'</ol></details>';}

/* Regroupe les exercices en rangées : un superset reste côte à côte, deux exercices simples se partagent une rangée (grand écran) */
function exRows(s,n){
  var items=sessionEx(s.code,n).map(function(ex){return {ex:ex,h:exCard(ex,n)};});
  if(s.fin&&modeFor(n,s.code)==="full") items.push({ex:{id:s.fin},h:finCard(s.fin,n)});
  var used={},out="";
  for(var i=0;i<items.length;i++){
    if(used[i]) continue;
    used[i]=1;var row=[items[i]],j=-1,ex=items[i].ex;
    if(ex.ss){for(var k=i+1;k<items.length;k++){if(!used[k]&&items[k].ex.id===ex.ss){j=k;break;}}}
    else{for(var m=i+1;m<items.length;m++){if(!used[m]){if(!items[m].ex.ss) j=m;break;}}}
    if(j>=0){used[j]=1;row.push(items[j]);}
    out+='<div class="exrow'+(row.length>1?' two':'')+'">'+row.map(function(r){return r.h;}).join("")+'</div>';
  }
  return out;
}
function renderSession(sid){
  var n=state.week,s=S[sid],p=phase(n);
  if(sid==="E") return renderE(n);
  var h=sessionHead(sid,n);
  if(sid==="D"&&p.noD) return h+'<p class="note warn">Pas de séance D cette semaine : tests le '+TESTS[n]+'. Voir l’onglet Plan.</p>';
  h+=warmBlock(s.warm);
  h+=exRows(s,n);
  h+='<p class="note">'+esc(COOL)+'</p>';
  return h+sessFoot(sid,n);
}

var CARDIO_ALTS=[{k:"",name:"Course facile"},{k:"bike",tag:"Genou",name:"Vélo ou VTT"},{k:"walk",tag:"Genou",name:"Marche rapide en côte"},{k:"step",tag:"Météo",name:"Step-ups bas en musique, à l’intérieur"}];
function renderE(n){
  var p=phase(n),en=entry(n,"E1"),v=state.swaps.E1||(p.vtt?"bike":""),mins=modeFor(n,"E")==="full"?p.cardio:+modeFor(n,"E");
  var act=CARDIO_ALTS.filter(function(a){return a.k===v;})[0]||CARDIO_ALTS[0];
  var h=sessionHead("E",n);
  h+='<article class="ex"'+exStyle("E1")+' data-ex="E1" data-w="'+n+'">';
  h+=exTop("E1","E1",esc(act.name)+(v&&!p.vtt?'<small>Variante · '+esc(act.tag)+'</small>':''));
  h+='<div class="rx"><span class="big">'+mins+' min</span><span>RPE 3-4 / 10</span><span class="mut">progresse de 35 à 45 min sur l’année</span></div>';
  var c=[];
  if(!v) c.push("Course facile sur terrain plat. Raccourcis un peu ta foulée : environ 5 à 10 % de pas en plus par minute.");
  if(v==="bike") c.push(p.vtt?"En vacances, ta sortie VTT remplace cette séance. Reste surtout en endurance, avec quelques relances.":"Vélo ou VTT en endurance : pédalage souple, sans forcer en côte.");
  if(v==="walk") c.push("Marche rapide en côte : les collines autour de Cluj font très bien l’affaire.");
  if(v==="step") c.push("Step-ups alternés sur une marche basse, en musique, sans t’arrêter.");
  c.push("Bonne intensité : tu peux parler en phrases complètes, environ 120 à 140 battements par minute.");
  if(p.acc&&!v) c.push("À la fin : 4 à 6 accélérations progressives de 60 à 80 m, 1 à 2 min de marche entre chacune. Jamais sur sol gelé ou mouillé.");
  h+=tech("c-E1",c,'');
  h+='<label class="ver"><span>Version</span><select class="in" id="E1-ver" data-ver="E1">'+CARDIO_ALTS.map(function(a){return '<option value="'+a.k+'"'+(a.k===v?" selected":"")+'>'+(a.k?esc(a.tag)+' → ':'Base : ')+esc(a.name)+'</option>';}).join("")+'</select></label>';
  h+='<div class="log">'+logHead(en)+'<label class="fld"><span>Durée (min)</span><input class="in in-num" id="E1-min" data-f="min" inputmode="decimal" autocomplete="off" placeholder="'+mins+'" value="'+esc(en.min||"")+'"></label>';
  h+='<label class="fld"><span>Distance (km)</span><input class="in in-num" id="E1-km" data-f="km" inputmode="decimal" autocomplete="off" value="'+esc(en.km||"")+'"></label>';
  h+='<label class="fld"><span>Effort /10</span><select class="in" id="E1-rpe" data-f="rpe">'+opts10(en.rpe)+'</select></label>';
  h+='<label class="fld fld-note"><span>Note</span><input class="in in-note" id="E1-note" data-f="note" autocomplete="off" placeholder="Parcours, dénivelé, sensations…" value="'+esc(en.note||"")+'"></label></div></article>';
  var mob=[["Fente basse, étirement des fléchisseurs de hanche","2 × 30 s / côté"],["Position 90/90 au sol","1 min"],["Rotation thoracique allongé sur le côté","8 / côté"],["Suspension passive à la barre","2 × 30 s"]];
  h+='<article class="ex"'+exStyle("E2")+'>'+exTop("E2","E2","Mobilité, 6 min")+'<ol class="wlist" style="padding:0 0 0 18px">'+mob.map(function(it){return '<li><div class="wi"><span>'+esc(it[0])+'</span><span class="dose">'+esc(it[1])+'</span></div></li>';}).join("")+'</ol></article>';
  return h+sessFoot("E",n);
}

function renderPlan(){
  var n=state.week,p=phase(n),o=state.weeks[n]||{},done=o.done||{},body=o.body||{},tests=o.tests||{};
  var h='<section class="card hero-wk"><div class="hero-num">Semaine '+n+' <span>depuis oct. 2026</span></div><div class="wk-sub">'+weekRange(n)+' · '+esc(p.name)+'</div><p class="hero-txt">'+esc(p.txt)+'</p>'+painBanner()+'</section>';
  var days=plannedDays(n);
  var hero=h;h='';
  h+='<section class="card" style="order:1"><h2 class="h2">La semaine</h2><p class="p-mut">Déplace les séances et choisis une durée. Les formats courts gardent les mouvements prioritaires.</p><div class="schedule">';
  ORDER.forEach(function(sid){
    h+='<div class="schedule-row"><b>'+sid+' · '+esc(S[sid].title)+'</b><label>Jour <select class="in" data-sched-sid="'+sid+'" aria-label="Jour de la séance '+sid+'">'+DAYS.map(function(day,i){return '<option value="'+(i+1)+'"'+(dayFor(n,sid)===i+1?' selected':'')+'>'+day+'</option>';}).join("")+'</select></label><label>Durée <select class="in" data-mode-sid="'+sid+'" aria-label="Durée de la séance '+sid+'">'+[["full","Complet"],["45","45 min"],["30","30 min"]].map(function(m){return '<option value="'+m[0]+'"'+(modeFor(n,sid)===m[0]?' selected':'')+'>'+m[1]+'</option>';}).join("")+'</select></label></div>';
  });
  h+='</div><div class="plan">';
  days.forEach(function(d){
    if(d[1]==="D"&&p.noD){h+='<div class="plan-row"><span class="p-d">'+d[0]+'</span><span class="p-s"><small>Pas de séance D : tests le '+esc(TESTS[n])+'</small></span><span></span></div>';return;}
    if(d[1]){var s=S[d[1]],ok=!!done[d[1]];
      h+='<button type="button" class="plan-row" data-tab="'+d[1]+'"><span class="p-d">'+d[0]+'</span><span class="p-s"><span class="pl-ic" style="'+hueStyle(SESSKIND[d[1]])+'">'+ico(SESSICON[d[1]],18,1.9)+'</span><span class="p-tx">'+esc(s.title)+' <small>· '+(modeFor(n,d[1])!=="full"?modeFor(n,d[1])+" min":d[1]==="E"?p.cardio+" min":esc(s.dur))+'</small></span></span><span class="p-st'+(ok?" ok":"")+'">'+(ok?"✓ faite":"à faire")+'</span></button>';
    } else h+='<div class="plan-row"><span class="p-d">'+d[0]+'</span><span class="p-s"><small>'+esc(d[2])+'</small></span><span></span></div>';
  });
  h+='</div></section>';var sWeek=h;h='';
  h+=progCard();var sProg=h.replace('<section class="card">','<section class="card" style="order:2">');h='';
  var sTests="";
  if(TESTS[n]){
    h+='<section class="card" data-testw="'+n+'"><h2 class="h2">Tests · '+esc(TESTS[n])+'</h2><p class="p-mut" style="margin-bottom:12px">À froid, après 48 à 72 h sans tirage lourd. Tractions strictes, même amplitude ; pompes strictes, corps gainé ; saut : meilleur de 3 essais.</p><div class="meas">';
    [["pull","Tractions strictes max"],["push","Pompes strictes max"],["jump","Saut vertical (cm)"]].forEach(function(t){h+='<label class="fld"><span>'+t[1]+'</span><input class="in in-num" id="test-'+t[0]+'" data-test="'+t[0]+'" inputmode="decimal" autocomplete="off" value="'+esc(tests[t[0]]||"")+'"></label>';});
    h+='</div><p class="p-mut" style="margin-top:10px">Référence de départ : 16 tractions strictes (fin septembre).</p></section>';
    sTests=h.replace('<section class="card"','<section style="order:3" class="card"');h='';
  }
  h+='<section class="card" style="order:4"><h2 class="h2">Le calendrier</h2><div class="cal">';
  for(var k=Math.max(FIRST,n-8);k<=n+8;k++){var pk=phase(k),dc=doneCount(k);
    h+='<button type="button" class="wc'+(pk.light?" light":"")+(pk.key==="vac"?" vac":"")+(k===n?" cur":"")+'" data-week="'+k+'" aria-label="Semaine '+k+', '+esc(pk.name)+'"><span class="n">S'+k+'</span><span class="p">'+esc(pk.short)+'</span><span class="c">'+(dc?dc+"/5":"")+'</span></button>';}
  h+='</div><div class="legend"><span><i></i>Entraînement normal</span><span><i class="l"></i>Semaine allégée (examens, affûtage)</span><span><i class="v"></i>Vacances</span></div></section>';
  var sCal=h;h='';
  h+='<section class="card" style="order:5" data-bodyw="'+n+'"><h2 class="h2">Mesures de la semaine</h2><p class="p-mut" style="margin-bottom:12px">Poids : moyenne des pesées du matin. Tour de taille : au nombril, toutes les 4 semaines. Cap : +0,25 à +0,5 kg par mois.</p><div class="meas">';
  h+='<label class="fld"><span>Poids moyen (kg)</span><input class="in in-num" id="body-weight" data-body="weight" inputmode="decimal" autocomplete="off" placeholder="61,0" value="'+esc(body.weight||"")+'"></label>';
  h+='<label class="fld"><span>Tour de taille (cm)</span><input class="in in-num" id="body-waist" data-body="waist" inputmode="decimal" autocomplete="off" placeholder="—" value="'+esc(body.waist||"")+'"></label></div>';
  var rows=[];for(var i=HFIRST;i<=LAST;i++){var b=(state.weeks[i]&&state.weeks[i].body)||{},t=(state.weeks[i]&&state.weeks[i].tests)||{};if(b.weight||b.waist||t.pull||t.push||t.jump) rows.push('<tr><td>'+wLab(i)+'</td><td>'+esc(b.weight||"–")+'</td><td>'+esc(b.waist||"–")+'</td><td>'+esc(t.pull||"–")+'</td><td>'+esc(t.push||"–")+'</td><td>'+esc(t.jump||"–")+'</td></tr>');}
  if(rows.length) h+='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sem.</th><th>Poids</th><th>Taille</th><th>Tractions</th><th>Pompes</th><th>Saut</th></tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';
  h+='</section>';var sBody=h;
  return hero+'<div class="pcol">'+sWeek+sCal+sBody+'</div><div class="pcol">'+sProg+sTests+ghCard()+dataCard()+'</div>';
}

/* Séance en cours : saisie concentrée, étape mémorisée, pas de données dupliquées. */
function saveLive(v){state.live=v;lsSet(LS_LIVE,v);}
function liveList(sid,n){
 var list=sessionEx(sid,n),s=S[sid],steps=[],used={};
 list.forEach(function(ex){
  if(used[ex.id])return;
  var step=[ex];used[ex.id]=1;
  if(ex.ss){var p=list.filter(function(e){return e.id===ex.ss&&!used[e.id];})[0];if(p){step.push(p);used[p.id]=1;}}
  steps.push(step);
 });
 if(s.fin&&modeFor(n,sid)==="full")steps.push([{id:s.fin,name:"Finisher cardio"}]);
 return steps;
}
function liveAction(action){
 var l=state.live;if(!l||!S[l.sid])return;
 var list=liveList(l.sid,state.week);
 if(action==="prev")l.index=Math.max(0,l.index-1);
 if(action==="next")l.index=Math.min(list.length,l.index+1);
 if(action==="finish"){
  var w=wk(state.week);w.done[l.sid]=new Date().toISOString().slice(0,10);
  w.doneAt=w.doneAt||{};w.doneAt[l.sid]=Date.now();scheduleSave();l.index=list.length;
 }
 saveLive(l);render();window.scrollTo(0,0);
}
function renderLive(){
 var n=state.week,l=state.live;
 if(!l||l.week!==n||!S[l.sid]){
  var today=(new Date().getDay()+6)%7+1;
  l={week:n,sid:ORDER.filter(function(sid){return dayFor(n,sid)===today;})[0]||"A",index:0};saveLive(l);
 }
 var sid=l.sid,list=liveList(sid,n),idx=Math.max(0,Math.min(l.index,list.length));
 var done=!!(state.weeks[n]&&state.weeks[n].done&&state.weeks[n].done[sid]);
 var h='<section class="card live-h"><h1 class="s-title">Séance en cours</h1><p class="p-mut">Un exercice à la fois. Ta position et tes saisies sont conservées quand tu fermes la page.</p>';
 h+='<label class="fld">Séance <select class="in" data-live-sid="1" aria-label="Séance à suivre">'+ORDER.map(function(k){return '<option value="'+k+'"'+(k===sid?' selected':'')+'>'+k+' · '+esc(S[k].title)+'</option>';}).join("")+'</select></label>';
 h+='<div class="live-meter" role="progressbar" aria-valuemin="0" aria-valuemax="'+Math.max(1,list.length)+'" aria-valuenow="'+idx+'"><i style="width:'+(100*idx/Math.max(1,list.length))+'%"></i></div><strong>'+Math.min(idx+1,list.length)+' / '+list.length+' étapes</strong></section>';
 if(sid==="E")h+=renderE(n);
 else if(idx<list.length)h+=list[idx].map(function(ex){return ex.id===S[sid].fin?finCard(S[sid].fin,n):exCard(ex,n);}).join("");
 else h+='<section class="card"><h2 class="h2">Séance parcourue</h2><p>Les séries ont été enregistrées au fur et à mesure. Tu peux revenir ou terminer.</p>'+(done?'<p class="note">✓ Séance déjà faite.</p>':'')+'</section>';
 h+='<section class="card live-nav"><button type="button" class="ghost" data-live-action="prev"'+(idx===0?' disabled':'')+'>← Précédent</button>';
 if(idx<list.length)h+='<button type="button" class="chk on" data-live-action="next">Suivant →</button>';
 else h+='<button type="button" class="chk on" data-live-action="finish"'+(done?' disabled':'')+'>✓ Terminer la séance</button>';
 return h+'</section>';
}
function renderRules(){
  var all=''+
  '<section class="card prose"><h2 class="h2">Le principe de ce carnet</h2><p>Chaque exercice affiché est la <b>version de base</b>, pensée comme si tu n’avais aucune douleur. Quand une contrainte apparaît (genou, épaule, matériel, météo), ouvre le menu <b>Version</b> de l’exercice et choisis la variante. Elle reste en place les semaines suivantes jusqu’à ce que tu remettes « Base ».</p><p>La consigne de progression ne compare que des séances faites dans la même version.</p><p>Les données sont locales sauf si tu actives la synchronisation. Pense à exporter une sauvegarde depuis l’onglet Plan ; pour faire le point avec un coach, envoie-lui l’export tableur (CSV).</p></section>'+
  '<section class="card prose"><h2 class="h2">Lire une prescription</h2><ul>'+
  '<li><b>4 × 4-6</b> : 4 séries, entre 4 et 6 répétitions.</li>'+
  '<li><b>RIR 2</b> : tu t’arrêtes quand il te reste 2 reps propres en réserve. Tu peux noter le RIR vraiment atteint par exercice pour affiner la prochaine consigne.</li>'+
  '<li><b>Force</b> (tractions, développé au sol, fentes, step-ups…) : RIR 1-2, jamais l’échec. <b>Isolation</b> (latérales, curl, triceps, mollets, leg curl) : RIR 0-1. <b>Sauts et swings</b> : vitesse maximale, tu arrêtes quand ça ralentit.</li>'+
  '<li><b>Superset</b> : tu alternes deux exercices, avec le repos indiqué après chacun.</li>'+
  '<li><b>Repos</b> : bouton « Repos » sur chaque exercice ; le minuteur s’affiche en bas et bipe.</li></ul></section>'+
  '<section class="card prose"><h2 class="h2">Progresser : la règle de la 1re série</h2><ol>'+
  '<li>Regarde ta 1re série. Quand elle atteint le haut de la fourchette avec au moins 1 rep en réserve, ajoute le plus petit incrément (1 à 2,5 kg) à la séance suivante.</li>'+
  '<li>Les autres séries doivent seulement rester au-dessus du bas de la fourchette.</li>'+
  '<li>Une série passe sous le bas après une hausse : même charge, reconstruis les reps. Si c’est la 1re série : reviens à la charge précédente.</li>'+
  '<li>Élévations latérales : tu montes quand les 2 premières séries atteignent 15.</li></ol><p>La consigne colorée sous chaque exercice applique tout ça à partir de ce que tu as noté.</p></section>'+
  '<section class="card prose"><h2 class="h2">Le cardio</h2><p>Par rapport à la V6.2, le cardio est doublé :</p><ul>'+
  '<li><b>Finisher de 8 à 12 min</b> à la fin des séances A et C : intensité haute, utile pour la VO₂max et les relances en VTT.</li>'+
  '<li><b>Mercredi</b> : 35 à 45 min d’endurance facile, avec des accélérations pendant les blocs. En vacances, le VTT le remplace.</li>'+
  '<li><b>Vendredi</b> : marche active, et 30 min de vélo ou de marche en plus si tu es frais.</li></ul><p>Ça fait 1 h 15 à 1 h 40 de cardio par semaine, sans voler la récupération des jambes.</p></section>'+
  '<section class="card prose"><h2 class="h2">Le calendrier</h2><ul>'+
  '<li><b>S3</b> calibrage · <b>S4-S7</b> bloc 1 · <b>S8</b> examens (semaine allégée, test 1 samedi 28 nov.)</li>'+
  '<li><b>S9-S10</b> bloc 2, plus lourd · <b>S11</b> affûtage et test 2 (vendredi 18 déc.)</li>'+
  '<li><b>S12-S14</b> vacances en France · <b>S15</b> reprise à −10 % · <b>S16-S19</b> bloc 3</li>'+
  '<li><b>S20</b> examens · <b>S21</b> intersemestre et test 3 (vendredi 26 févr.) · ensuite, cycles de cinq semaines normales suivies d’une semaine allégée.</li></ul><p>Séance ratée : décale-la en gardant l’ordre A → B → C → D, avec 48 h entre les deux séances de jambes. Si tu dois regrouper, enlève une série plutôt que de forcer.</p></section>'+
  '<section class="card prose"><h2 class="h2">Douleur : la règle des 3/10</h2><ul>'+
  '<li>Jusqu’à 3/10 pendant l’effort, revenue à la normale le lendemain matin : tu continues la version de base.</li>'+
  '<li>Au-delà, ou plus mal le lendemain : passe l’exercice en version « Genou » ou « Épaule ».</li>'+
  '<li>Gonflement, blocage, dérobement, ou douleur qui dure plusieurs semaines : kiné ou médecin du sport.</li></ul></section>'+
  '<section class="card prose"><h2 class="h2">Alimentation</h2><ul>'+
  '<li>Prise lente : +0,25 à +0,5 kg par mois jusqu’au bilan de fin avril, pas de sèche automatique.</li>'+
  '<li>Protéines : 100 à 135 g par jour, environ 30 g par repas plus une collation.</li>'+
  '<li>Tour de taille qui prend plus de 1 cm par mois : réduis un peu l’apport.</li></ul></section>'+
  '<section class="card prose"><h2 class="h2">Matériel prévu par la V6.2</h2><ul>'+
  '<li>Ceinture de lest à chaîne (tractions, chin-ups, dips), barres à dips stables, 2 disques de 5 kg.</li>'+
  '<li>En attendant : gilet de 10 kg. Les dips lestés sont remplacés par le développé au sol aux haltères (A3) : il se charge facilement à la maison et ménage l’avant de l’épaule. Tes anciennes séances de dips restent visibles dans Progrès.</li></ul></section>';
  var parts=all.split("</section>").filter(function(x){return x;}).map(function(p,i){return p.replace('<section class="card prose">','<section class="card prose" style="order:'+(i+1)+'">')+"</section>";});
  function col(ix){return '<div class="pcol">'+ix.map(function(i){return parts[i];}).join("")+'</div>';}
  return col([0,2,4,6])+col([1,3,5,7]);
}

function render(){
  pendingRender=false;renderHeader();
  var t=state.tab;
  main.className="wrap main t-"+t;
  main.innerHTML=t==="plan"?renderPlan():t==="live"?renderLive():t==="regles"?renderRules():t==="progres"?renderProgress():renderSession(t);
}

/* ---------- Progrès : graphiques ---------- */
var LS_PROG="carnet62.prog";
function fmtN(v){return v==null?"–":String(Math.round(v*10)/10).replace(".",",");}
function loadInfo(s){
 if(s==null||String(s).trim()==="")return null;
 var t=String(s).trim().replace(/,/g,"."),x,m=t.match(/^2\s*[×xX*]\s*(\d+(?:\.\d+)?)/);
 if(m){x=+m[1];return {per:x,total:2*x,pair:true,added:false};}
 var g=t.match(/(\d+(?:\.\d+)?)\s*[×xX*]\s*(\d+(?:\.\d+)?)/);   /* ancien format « n × charge » : on garde la 2e valeur */
 if(g){x=+g[2];return {per:x,total:x,pair:false,added:false};}
 var v=t.match(/[-+]?\d+(?:\.\d+)?/);if(!v)return null;
 x=+v[0];return {per:x,total:x,pair:false,added:v.index===0&&v[0].charAt(0)==="+"};
}
function parseLoad(s){var x=loadInfo(s);return x?x.per:null;}
function externalLoad(s){var x=loadInfo(s);return x?x.total:null;}
function bodyweightAt(n){for(var w=n;w>=HFIRST;w--){var b=state.weeks[w]&&state.weeks[w].body,v=num(b&&b.weight);if(v>0)return v;}return null;}
function estimateLoad(ex,e,n){var x=loadInfo(e.load);if(!x)return null;
 if(x.added&&["A2","C2","C3","A3"].indexOf(ex.id)>=0){var bw=bodyweightAt(n);return bw!=null?bw+x.total:null;}
 return x.total>0?x.total:null;
}
function sum(a){return a.reduce(function(s,x){return s+x;},0);}
function niceTicks(lo,hi,count){
  if(hi===lo){hi=lo+1;lo=lo>0?lo-1:lo;}
  var raw=(hi-lo)/count,mag=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)),f=raw/mag;
  var step=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*mag,t0=Math.floor(lo/step)*step,t1=Math.ceil(hi/step)*step,out=[];
  for(var v=t0;v<=t1+step/1000;v+=step) out.push(Math.round(v*1000)/1000);
  return out;
}
var chartSeq=0;
function chartW(){
  var cs=getComputedStyle(main),inner=main.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
  var cols=(state.tab==="progres"&&window.matchMedia("(min-width:1280px)").matches)?2:1;
  return Math.max(260,Math.min(760,Math.floor((inner-(cols-1)*44)/cols)));
}
function chart(cfg){
  /* cfg : {title, sub, type:'line'|'col', pts:[{n,y,tip}], unit, zero, max} — une seule série, une seule échelle */
  var id="ch"+(++chartSeq), pts=cfg.pts.filter(function(p){return p.y!=null;});
  var head='<div class="viz-h"><span class="viz-t">'+esc(cfg.title)+'</span><span class="viz-s">'+esc(cfg.sub||"")+'</span></div>';
  if(!pts.length) return '<div class="viz">'+head+'<div class="viz-empty">'+esc(cfg.empty||"Rien de noté pour l’instant. Les valeurs apparaîtront ici dès ta première séance notée.")+'</div></div>';
  var allPts=pts.slice(),hi0=Math.max.apply(null,pts.map(function(p){return p.n;}));
  var lo0=Math.max(HFIRST,hi0-35);pts=pts.filter(function(p){return p.n>=lo0;});
  var W=chartW(),H=170,pl=36,pr=12,pt=14,pb=24,x0=pl,x1=W-pr,y0=H-pb,y1=pt,slots=hi0-lo0+1,bw=(x1-x0)/slots;
  function X(n){return x0+bw*(n-lo0)+bw/2;}
  var vals=pts.map(function(p){return p.y;}),lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals);
  if(cfg.type==="col"||cfg.zero) lo=0;
  if(cfg.max!=null) hi=Math.max(hi,cfg.max);
  if(cfg.ref){lo=Math.min(lo,cfg.ref.v);hi=Math.max(hi,cfg.ref.v);}
  var ticks=cfg.ticks||niceTicks(lo,hi,3),tmin=ticks[0],tmax=ticks[ticks.length-1];
  function Y(v){return y0-(v-tmin)/((tmax-tmin)||1)*(y0-y1);}
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(cfg.title)+'" data-chart="'+id+'">';
  for(var n=lo0;n<=hi0;n++){if(phase(n).light) s+='<rect class="band" x="'+(X(n)-bw/2).toFixed(1)+'" y="'+y1+'" width="'+bw.toFixed(1)+'" height="'+(y0-y1)+'"/>';}
  ticks.forEach(function(t){var y=Y(t).toFixed(1);s+='<line class="grid" x1="'+x0+'" x2="'+x1+'" y1="'+y+'" y2="'+y+'"/><text class="ax" x="'+(x0-6)+'" y="'+y+'" dy="3.5" text-anchor="end">'+String(Math.round(t*100)/100).replace(".",",")+'</text>';});
  if(cfg.ref){var ry=Y(cfg.ref.v).toFixed(1);s+='<line class="ref" x1="'+x0+'" x2="'+x1+'" y1="'+ry+'" y2="'+ry+'"/><text class="reft" x="'+(x1-2)+'" y="'+(Y(cfg.ref.v)-5).toFixed(1)+'" text-anchor="end">'+esc(cfg.ref.label||"")+'</text>';}
  if(lo0<FIRST) s+='<line class="sep" x1="'+(X(FIRST)-bw/2).toFixed(1)+'" x2="'+(X(FIRST)-bw/2).toFixed(1)+'" y1="'+(y1-6)+'" y2="'+y0+'"/>';
  var labs=[],used=[];
  function addLab(n,t){var x=X(n);for(var i=0;i<used.length;i++){if(Math.abs(used[i]-x)<34) return;}used.push(x);labs.push([x,t]);}
  for(var k=(lo0<FIRST?0:FIRST);k<=hi0;k+=(W<420?3:2)){if(k>=lo0) addLab(k,"S"+k);}
  for(var mk=lo0;mk<0;mk++){if(mk===lo0||dOf(mk,0).getMonth()!==dOf(mk-1,0).getMonth()) addLab(mk,MONTHS[dOf(mk,0).getMonth()]);}
  labs.forEach(function(l){s+='<text class="ax" x="'+l[0].toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle">'+l[1]+'</text>';});
  if(cfg.type==="col"){
    var cw=Math.min(18,Math.max(4,bw-4));
    pts.forEach(function(p,i){var x=X(p.n)-cw/2,y=Y(p.y),h=y0-y,r=Math.min(6,h,cw/2);
      if(h<=0) return;
      s+='<path class="col" id="'+id+'-m'+i+'" d="M'+x.toFixed(1)+' '+y0+'V'+(y+r).toFixed(1)+'Q'+x.toFixed(1)+' '+y.toFixed(1)+' '+(x+r).toFixed(1)+' '+y.toFixed(1)+'H'+(x+cw-r).toFixed(1)+'Q'+(x+cw).toFixed(1)+' '+y.toFixed(1)+' '+(x+cw).toFixed(1)+' '+(y+r).toFixed(1)+'V'+y0+'Z"/>';});
  } else {
    s+='<line class="xh" id="'+id+'-xh" x1="0" x2="0" y1="'+y1+'" y2="'+y0+'" visibility="hidden"/>';
    s+='<path class="ln" d="'+pts.map(function(p,i){return (i?"L":"M")+X(p.n).toFixed(1)+" "+Y(p.y).toFixed(1);}).join("")+'"/>';
    pts.forEach(function(p){s+='<circle class="dot" cx="'+X(p.n).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="3.4"/>';});
    var lp=pts[pts.length-1],lx=X(lp.n),anchor=lx>x1-40?"end":"start";
    s+='<text class="lbl" x="'+(anchor==="end"?lx-8:lx+8).toFixed(1)+'" y="'+(Y(lp.y)-8).toFixed(1)+'" text-anchor="'+anchor+'">'+fmtN(lp.y)+(cfg.unit?" "+esc(cfg.unit):"")+'</text>';
  }
  pts.forEach(function(p,i){s+='<rect class="hit" x="'+(X(p.n)-bw/2).toFixed(1)+'" y="'+y1+'" width="'+bw.toFixed(1)+'" height="'+(y0-y1)+'" data-chart="'+id+'" data-i="'+i+'" data-cx="'+X(p.n).toFixed(1)+'" data-v="'+esc(fmtN(p.y)+(cfg.unit?" "+cfg.unit:""))+'" data-l="'+esc(wLab(p.n)+(p.tip?" · "+p.tip:""))+'"/>';});
  s+='</svg>';
  var tv='<details class="tv"><summary>Voir les valeurs</summary><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Semaine</th><th>'+esc(cfg.title)+'</th><th>Détail</th></tr></thead><tbody>'+allPts.map(function(p){return '<tr><td>'+wLab(p.n)+'</td><td>'+fmtN(p.y)+(cfg.unit?" "+esc(cfg.unit):"")+'</td><td>'+esc(p.tip||"")+'</td></tr>';}).join("")+'</tbody></table></div></details>';
  return '<div class="viz">'+head+s+tv+'</div>';
}
function tile(label,a,b,unit,goodUp){
  var d=(a!=null&&b!=null)?b-a:null,u=unit?" "+unit:"";
  var dTxt=d==null?"":(d===0?"stable depuis le début":(d>0?"+":"−")+fmtN(Math.abs(d))+u+" depuis le début");
  var pos=d!=null&&d!==0&&((d>0)===(goodUp!==false));
  return '<div class="tile"><span class="tile-l">'+esc(label)+'</span><span class="tile-v">'+(b==null?"–":fmtN(b)+u)+'</span><span class="tile-d'+(pos?" pos":"")+'">'+esc(dTxt||"pas encore de point de comparaison")+'</span></div>';
}
function progOptions(){
  var opts=[];
  ["A","B","C","D"].forEach(function(sid){
    var g={label:"Séance "+sid+" · "+S[sid].day,items:[]};
    S[sid].ex.forEach(function(ex){
      g.items.push({key:ex.id+"|",label:(ex.label||ex.id)+" · "+ex.name,ex:ex,alt:null});
      (ex.alts||[]).forEach(function(a){
        var used=false;for(var n=HFIRST;n<=LAST;n++){var e=entry(n,ex.id);if((e.v||"")===a.k&&hasData(e)){used=true;break;}}
        if(used) g.items.push({key:ex.id+"|"+a.k,label:(ex.label||ex.id)+" · "+a.name+" (variante)",ex:ex,alt:a});
      });
    });
    opts.push(g);
  });
  var old={label:"Anciens exercices",items:[]};
  RETIRED.forEach(function(ex){
    var used=false;for(var n=HFIRST;n<=LAST;n++){var e=entry(n,ex.id);if(!(e.v)&&hasData(e)){used=true;break;}}
    if(used) old.items.push({key:ex.id+"|",label:(ex.label||ex.id)+" · "+ex.name+" (retiré)",ex:ex,alt:null});
  });
  if(old.items.length) opts.push(old);
  return opts;
}
function exSeries(ex,alt){
  var v=alt?alt.k:"",k=kindOf(ex,alt),out=[];
  for(var n=HFIRST;n<=LAST;n++){
    var e=entry(n,ex.id);if(!hasData(e)||(e.v||"")!==v) continue;
    var sv=setVals(e);
    out.push({n:n,note:e.note||"",load:externalLoad(e.load),estimated:estimateLoad(ex,e,n),loadTxt:e.load||"",sets:sv,total:sv.length?sum(sv):null,best:num(e.best),emom:num(e.total)});
  }
  return {k:k,rows:out};
}
function heatmap(){
  var cur=todayWeek(),cols=[],ok=0,plan=0;for(var n=Math.max(FIRST,cur-17);n<=cur+1;n++) cols.push(n);
  var c='<span></span>'+cols.map(function(n){return '<span class="hx">'+(((n-FIRST)%3===0)?'<span>S'+n+'</span>':'')+'</span>';}).join("");
  ORDER.forEach(function(sid){
    c+='<span class="hl">'+sid+'</span>';
    cols.forEach(function(n){
      var p=phase(n),o=state.weeks[n]||{},d=!!(o.done&&o.done[sid]),cls;
      if(sid==="D"&&p.noD&&!d) cls="sk";
      else if(d){cls="ok";ok++;if(n<=cur) plan++;}
      else if(n<cur){cls="";plan++;}
      else if(n===cur){cls="cur";plan++;}
      else cls="fut";
      c+='<i'+(cls?' class="'+cls+'"':'')+' title="S'+n+' · '+sid+'"></i>';
    });
  });
  var aria=ok+" séance"+(ok>1?"s":"")+" faite"+(ok>1?"s":"")+" sur "+plan+" prévues jusqu’ici";
  return '<div class="viz"><div class="viz-h"><span class="viz-t">Régularité</span><span class="viz-s">un point = une séance</span></div><div class="heat" style="--cols:'+cols.length+'" role="img" aria-label="'+esc(aria)+'">'+c+'</div><div class="heat-leg"><span><i class="ok"></i>Faite</span><span><i></i>Manquée</span><span><i class="cur"></i>Semaine en cours</span></div></div>';
}
function muscleBars(n){
  var tot={},any=false;
  ORDER.forEach(function(sid){exAll(sid).forEach(function(ex){
    var en=entry(n,ex.id),k=setVals(en).filter(function(v){return v>0;}).length;if(!k) return;
    var m=muscOf(ex.id,en.v||"");if(!m) return;
    m.p.forEach(function(g){tot[g]=(tot[g]||0)+k;});m.s.forEach(function(g){tot[g]=(tot[g]||0)+k*0.5;});any=true;
  });});
  var head='<div class="viz-h"><span class="viz-t">Séries par muscle · S'+n+'</span><span class="viz-s">principal = 1, secondaire = ½</span></div>';
  if(!any) return '<div class="viz">'+head+'<div class="viz-empty">Note tes reps dans les séances de la semaine affichée (flèches en haut pour changer de semaine).</div></div>';
  var keys=Object.keys(tot).sort(function(a,b){return tot[b]-tot[a];}),mx=tot[keys[0]]||1;
  return '<div class="viz">'+head+'<div class="mbars">'+keys.map(function(g){return '<div class="mb"><span>'+esc(cap(MN[g]||g))+'</span><div class="bar"><b style="width:'+Math.max(3,Math.round(100*tot[g]/mx))+'%"></b></div><em>'+fmtN(tot[g])+'</em></div>';}).join("")+'</div></div>';
}
function weekVolume(n){
  var tv=0;
  ORDER.forEach(function(sid){exAll(sid).forEach(function(ex){
    var en=entry(n,ex.id);if(!en||!en.sets) return;
    var alt=null;(ex.alts||[]).forEach(function(a){if(a.k===(en.v||"")) alt=a;});
    if(((alt&&alt.rx&&alt.rx.unit)||ex.unit)==="s") return;
    var ld=externalLoad(en.load);if(!(ld>0)) return;
    tv+=ld*sum(setVals(en))*(ex.side?2:1);
  });});
  return tv;
}
function renderProgress(){
  chartSeq=0;
  var groups=progOptions(),all=[];groups.forEach(function(g){all=all.concat(g.items);});
  var sel=state.prog||lsGet(LS_PROG);
  if(!sel||!all.some(function(i){return i.key===sel;})){
    sel=null;for(var i=0;i<all.length&&!sel;i++){if(exSeries(all[i].ex,all[i].alt).rows.length) sel=all[i].key;}
    sel=sel||"A2|";
  }
  var item=all.filter(function(i){return i.key===sel;})[0],ex=item.ex,alt=item.alt,ser=exSeries(ex,alt),r=ser.rows;
  var unitReps=((alt&&alt.rx&&alt.rx.unit)||ex.unit)==="s"?"s":"reps";
  var head='<section class="s-head"><div><h1 class="s-title">Progrès</h1><p class="s-meta">Tout ce que tu notes dans les séances, semaine après semaine. Les bandes colorées sont les semaines allégées. S0 à S2 sont tes séances d’avant le 19 octobre, reprises de ton carnet.</p></div></section>';
  /* Carte 1 : l'exercice choisi */
  var c1='<section class="card stack" style="order:1"><div class="filter-row"><select id="prog-ex" aria-label="Exercice à afficher">';
  groups.forEach(function(g){c1+='<optgroup label="'+esc(g.label)+'">'+g.items.map(function(i){return '<option value="'+esc(i.key)+'"'+(i.key===sel?" selected":"")+'>'+esc(i.label)+'</option>';}).join("")+'</optgroup>';});
  c1+='</select></div>';
  var first=r[0],last=r[r.length-1];
  if(ser.k==="jump"){
    c1+='<div class="tiles">'+tile("Meilleur saut",first&&first.best,last&&last.best,"cm")+'</div>';
    c1+=chart({title:"Meilleur saut",sub:"cm",type:"line",unit:"cm",pts:r.map(function(x){return {n:x.n,y:x.best};})});
  } else if(ser.k==="emom"){
    c1+='<div class="tiles">'+tile("Total EMOM",first&&first.emom,last&&last.emom,"reps")+'</div>';
    c1+=chart({title:"Total de l’EMOM",sub:"reps",type:"line",unit:"reps",pts:r.map(function(x){return {n:x.n,y:x.emom,tip:x.note};})});
  } else {
    var withLoad=r.filter(function(x){return x.load!=null;});
    if(last&&last.loadTxt){
      var comparable=r.filter(function(x){return x.loadTxt===last.loadTxt&&x.sets[0]!=null;});
      if(comparable.length>1)c1+='<div class="tiles">'+tile("1re série à "+last.loadTxt,comparable[0].sets[0],comparable[comparable.length-1].sets[0],"reps")+'</div>';
    }
    if(r.length){var bestReps=Math.max.apply(null,r.map(function(x){return x.sets[0]||0;}));
      if(bestReps)c1+='<p class="p-mut">Record de répétitions en première série : <b>'+bestReps+'</b> (toutes charges confondues).</p>';}

    var tl=withLoad.length?tile("Charge",withLoad[0].load,withLoad[withLoad.length-1].load,"kg"):"";
    c1+='<div class="tiles">'+tl+tile(unitReps==="s"?"Secondes, toutes séries":"Reps, toutes séries",first&&first.total,last&&last.total,unitReps)+tile("1re série",first&&first.sets[0],last&&last.sets[0],unitReps)+'</div>';
    var hasLoad=!ex.noLoad||(alt&&alt.noLoad===0);
    if(hasLoad) c1+=chart({title:"Charge notée",sub:"kg · « 2 × 20 » compte 40 au total",type:"line",unit:"kg",pts:r.map(function(x){return {n:x.n,y:x.load,tip:x.loadTxt};})});
    if(hasLoad&&unitReps==="reps") c1+=chart({title:"Force estimée (1RM)",sub:"kg · Epley indicatif (poids du corps inclus pour les exercices lestés si renseigné)",type:"line",unit:"kg",empty:"Il faut une charge et une 1re série notées.",pts:r.map(function(x){var s0=x.sets[0];return {n:x.n,y:(x.estimated>0&&s0>0&&s0<=20)?Math.round(x.estimated*(1+s0/30)*10)/10:null,tip:x.loadTxt+" × "+s0};})});
    c1+=chart({title:unitReps==="s"?"Secondes, toutes séries":"Reps, toutes séries",sub:unitReps==="s"?"secondes":"reps",type:"line",unit:unitReps==="s"?"s":"reps",pts:r.map(function(x){return {n:x.n,y:x.total,tip:(x.loadTxt?x.loadTxt+" · ":"")+x.sets.join("/")};})});
  }
  c1+='</section>';
  /* Séries hebdomadaires pour les autres cartes */
  var cardio=[],effort=[],vol=[],wt=[],ws=[],pain=[],sleep=[],trows=[],totDone=0;
  for(var n=HFIRST;n<=LAST;n++){
    var o=state.weeks[n]||{};totDone+=doneCount(n);
    var e1=num(entry(n,"E1").min),a8=num(entry(n,"A8").min),c9=num(entry(n,"C9").min),tot=(e1||0)+(a8||0)+(c9||0);
    if(tot) cardio.push({n:n,y:tot,tip:"endurance "+fmtN(e1||0)+" + finishers "+fmtN((a8||0)+(c9||0))});
    var rp=["E1","A8","C9"].map(function(id){return num(entry(n,id).rpe);}).filter(function(x){return x!=null;});
    if(rp.length) effort.push({n:n,y:sum(rp)/rp.length,tip:rp.length+" mesure"+(rp.length>1?"s":"")});
    var tv=weekVolume(n);if(tv>0) vol.push({n:n,y:Math.round(tv),tip:"charge × reps"});
    var b=o.body||{};if(num(b.weight)!=null) wt.push({n:n,y:num(b.weight)});if(num(b.waist)!=null) ws.push({n:n,y:num(b.waist)});
    var t=o.tests||{};if(t.pull||t.push||t.jump) trows.push('<tr><td>'+wLab(n)+'</td><td>'+esc(t.pull||"–")+'</td><td>'+esc(t.push||"–")+'</td><td>'+esc(t.jump||"–")+'</td></tr>');
    var pm=null,wh=[],sl=[],ss=o.sess||{};
    for(var sk in ss){var pv=num(ss[sk].pain),sv=num(ss[sk].sleep);if(pv!=null){pm=Math.max(pm==null?0:pm,pv);if(pv>=3&&ss[sk].where) wh.push(sk+" : "+ss[sk].where);}if(sv!=null) sl.push(sv);}
    if(pm!=null) pain.push({n:n,y:pm,tip:wh.join(" · ")});
    if(sl.length) sleep.push({n:n,y:sum(sl)/sl.length,tip:sl.length+" séance"+(sl.length>1?"s":"")});
  }
  var totCardio=sum(cardio.map(function(d){return d.y;}));
  var planned=0;for(var pw=FIRST;pw<=todayWeek();pw++) planned+=phase(pw).noD?4:5;
  /* Carte 2 : l'entraînement */
  var c2='<section class="card stack" style="order:2"><h2 class="h2" style="margin:0">Entraînement</h2>';
  c2+='<div class="tiles"><div class="tile"><span class="tile-l">Séances faites</span><span class="tile-v">'+totDone+'</span><span class="tile-d">sur '+planned+' prévues jusqu’ici</span></div><div class="tile"><span class="tile-l">Cardio cumulé</span><span class="tile-v">'+fmtN(totCardio)+' min</span><span class="tile-d">endurance + finishers</span></div></div>';
  c2+=heatmap();
  c2+=chart({title:"Volume soulevé",sub:"kg · charge externe totale × reps (×2 si unilatéral)",type:"line",unit:"kg",pts:vol,empty:"Note tes charges et tes reps pour voir le volume de la semaine."});
  c2+=chart({title:"Cardio de la semaine",sub:"minutes",type:"line",unit:"min",pts:cardio,empty:"Note la durée du mercredi et les minutes des finishers."});
  c2+=chart({title:"Effort ressenti, cardio",sub:"/10 · moyenne mercredi + finishers",type:"line",unit:"/10",pts:effort,empty:"Note l’effort /10 après le cardio du mercredi et les finishers."});
  c2+=pushPull(state.week)+muscleBars(state.week);
  c2+='</section>';
  /* Carte 3 : le corps */
  var c3='<section class="card stack" style="order:3"><h2 class="h2" style="margin:0">Corps et tests</h2>';
  c3+='<div class="tiles">'+tile("Poids moyen",wt.length?wt[0].y:null,wt.length?wt[wt.length-1].y:null,"kg")+'</div>';
  c3+=chart({title:"Poids moyen",sub:"kg · cap +0,25 à +0,5 kg par mois",type:"line",unit:"kg",pts:wt,empty:"Note ton poids moyen dans l’onglet Plan."});
  c3+=chart({title:"Tour de taille",sub:"cm · alerte au-delà de +1 cm par mois",type:"line",unit:"cm",pts:ws,empty:"Note ton tour de taille dans l’onglet Plan, toutes les 4 semaines."});
  c3+='<div class="viz"><div class="viz-h"><span class="viz-t">Tests</span><span class="viz-s">référence : 16 tractions (fin sept.)</span></div>'+(trows.length?'<div class="tbl-wrap" style="margin-top:4px"><table class="tbl"><thead><tr><th>Sem.</th><th>Tractions</th><th>Pompes</th><th>Saut (cm)</th></tr></thead><tbody>'+trows.join("")+'</tbody></table></div>':'<div class="viz-empty">Tests prévus en S8, S11 et S21 : les résultats se notent dans l’onglet Plan.</div>')+'</div>';
  c3+='</section>';
  /* Carte 4 : la récupération */
  var pmax=pain.length?Math.max.apply(null,pain.map(function(p){return p.y;})):0;
  var c4='<section class="card stack" style="order:4"><h2 class="h2" style="margin:0">Récupération</h2>';
  c4+=chart({title:"Douleur maximale",sub:"/10 · pire séance de la semaine",type:"line",unit:"/10",zero:true,ref:{v:3,label:"seuil 3/10"},ticks:pmax<=5?[0,1,2,3,4,5]:null,pts:pain,empty:"Note la douleur max dans « Après la séance » : la règle des 3/10 se lit ici."});
  c4+=painZonesBlock();
  c4+=chart({title:"Sommeil",sub:"heures · moyenne des nuits notées",type:"line",unit:"h",pts:sleep,empty:"Note ton sommeil dans « Après la séance »."});
  c4+='</section>';
  return head+'<div class="pcol">'+c1+recordsCard()+c3+'</div><div class="pcol">'+c2+c4+'</div>';
}
var tipEl=document.getElementById("tip"),tipOn=null;
function showTip(hit,x,y){
  var cid=hit.getAttribute("data-chart"),i=hit.getAttribute("data-i");
  if(tipOn&&tipOn!==hit) hideTip();
  tipOn=hit;
  tipEl.textContent="";var b=document.createElement("b");b.textContent=hit.getAttribute("data-v");var s=document.createElement("span");s.textContent=hit.getAttribute("data-l");tipEl.appendChild(b);tipEl.appendChild(s);
  tipEl.hidden=false;
  var xh=document.getElementById(cid+"-xh");if(xh){xh.setAttribute("x1",hit.getAttribute("data-cx"));xh.setAttribute("x2",hit.getAttribute("data-cx"));xh.setAttribute("visibility","visible");}
  var m=document.getElementById(cid+"-m"+i);if(m) m.classList.add("on");
  var tw=tipEl.offsetWidth,th=tipEl.offsetHeight,left=Math.min(window.innerWidth-tw-8,Math.max(8,x-tw/2)),top=y-th-14;if(top<8) top=y+16;
  tipEl.style.left=left+"px";tipEl.style.top=top+"px";
}
function hideTip(){
  if(!tipOn) return;var cid=tipOn.getAttribute("data-chart"),i=tipOn.getAttribute("data-i");
  var xh=document.getElementById(cid+"-xh");if(xh) xh.setAttribute("visibility","hidden");
  var m=document.getElementById(cid+"-m"+i);if(m) m.classList.remove("on");
  tipOn=null;tipEl.hidden=true;
}
main.addEventListener("pointermove",function(e){var h=e.target.closest&&e.target.closest(".hit");if(h) showTip(h,e.clientX,e.clientY);else hideTip();});
main.addEventListener("pointerdown",function(e){var h=e.target.closest&&e.target.closest(".hit");if(h) showTip(h,e.clientX,e.clientY);else hideTip();});
main.addEventListener("pointerleave",hideTip);
window.addEventListener("scroll",hideTip,{passive:true});
var rsT=null;window.addEventListener("resize",function(){clearTimeout(rsT);rsT=setTimeout(function(){if(state.tab==="progres") requestRender();},200);});
function requestRender(){var a=document.activeElement;if(a&&main.contains(a)&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)){pendingRender=true;return;}render();}
main.addEventListener("focusout",function(){setTimeout(function(){if(pendingRender) requestRender();},0);});

/* Menus déroulants du plan : on retient ce qui est ouvert */
main.addEventListener("toggle",function(e){var d=e.target;if(d&&d.dataset&&d.dataset.open){if(d.open) state.open[d.dataset.open]=1;else delete state.open[d.dataset.open];}},true);

/* ---------- Saisie ---------- */
function onField(t){
  if(t.dataset.ver!=null) return;
  if(t.dataset.body){var bw=+t.closest("[data-bodyw]").dataset.bodyw;var bo=wk(bw).body;bo[t.dataset.body]=t.value.trim();bo.at=Date.now();scheduleSave(String(bw));return;}
  if(t.dataset.test){var tw=+t.closest("[data-testw]").dataset.testw;var to=wk(tw).tests;to[t.dataset.test]=t.value.trim();to.at=Date.now();scheduleSave(String(tw));return;}
  if(t.dataset.sf){var box=t.closest("[data-sess]"),sw=+box.dataset.w,o=wk(sw),ss=o.sess[box.dataset.sess]||(o.sess[box.dataset.sess]={});ss[t.dataset.sf]=t.value;ss.at=Date.now();scheduleSave(String(sw));return;}
  var card=t.closest("[data-ex]");if(!card||!t.dataset.f) return;
  markPending(card);
  var n=+card.dataset.w,id=card.dataset.ex,w=wk(n),en=w.ex[id]||(w.ex[id]={}),f=t.dataset.f;
  en.v=state.swaps[id]||"";en.at=Date.now();
  if(/^s\d+$/.test(f)){var i=+f.slice(1);en.sets=en.sets||[];en.sets[i]=t.value.trim();for(var k=0;k<en.sets.length;k++){if(en.sets[k]==null) en.sets[k]="";}}
  else en[f]=t.value;
  if(f==="load"||f==="s0") refreshPR(card,n,id);
  scheduleSave(String(n));
}
main.addEventListener("input",function(e){var t=e.target;if(t.type==="checkbox"||t.tagName==="SELECT") return;onField(t);});
main.addEventListener("change",function(e){
  var t=e.target;
  if(t.dataset.done){var n=state.week,o=wk(n);if(t.checked) o.done[t.dataset.done]=new Date().toISOString().slice(0,10);else delete o.done[t.dataset.done];o.doneAt=o.doneAt||{};o.doneAt[t.dataset.done]=Date.now();var lab=t.closest(".chk");if(lab) lab.classList.toggle("on",t.checked);renderHeader();scheduleSave(String(n));return;}
  if(t.id==="imp"){if(t.files&&t.files[0]) readImport(t.files[0]);t.value="";return;}
  if(t.id==="prog-ex"){state.prog=t.value;lsSet(LS_PROG,t.value);render();return;}
  if(t.dataset.schedSid){var ss=t.dataset.schedSid,ww=wk(state.week);ww.schedule=ww.schedule||{};ww.schedule[ss]=+t.value;ww.scheduleAt=Date.now();scheduleSave();render();return;}
  if(t.dataset.modeSid){var ss=t.dataset.modeSid,ww=wk(state.week);ww.modes=ww.modes||{};ww.modes[ss]=t.value;ww.modesAt=Date.now();scheduleSave();render();return;}
  if(t.dataset.liveSid){saveLive({week:state.week,sid:t.value,index:0});render();return;}
  if(t.dataset.ver!=null){var id=t.dataset.ver;if(t.value) state.swaps[id]=t.value;else delete state.swaps[id];state.swapsAt[id]=Date.now();scheduleSave("swaps");var y=window.scrollY;render();window.scrollTo(0,y);return;}
  if(t.tagName==="SELECT") onField(t);
});

/* ---------- Navigation ---------- */
/* ---------- Menu latéral ---------- */
var drawer=document.getElementById("top"),scrim=document.getElementById("scrim"),menuBtn=document.getElementById("menuBtn"),menuOpen=false;
function wide(){return window.matchMedia("(min-width:1024px)").matches;}
function openMenu(){if(wide()||menuOpen) return;menuOpen=true;drawer.classList.add("open");scrim.classList.add("show");document.body.classList.add("menu-open");menuBtn.setAttribute("aria-expanded","true");
  var a=drawer.querySelector('.tab[aria-selected="true"]');if(a){try{a.scrollIntoView({block:"nearest"});}catch(e){}}}
function closeMenu(focus){if(!menuOpen) return;menuOpen=false;drawer.classList.remove("open");scrim.classList.remove("show");document.body.classList.remove("menu-open");menuBtn.setAttribute("aria-expanded","false");if(focus){try{menuBtn.focus({preventScroll:true});}catch(e){}}}
scrim.addEventListener("click",function(){closeMenu(true);});
document.addEventListener("keydown",function(e){if(e.key==="Escape") closeMenu(true);});
window.addEventListener("resize",function(){if(wide()) closeMenu();});
(function(){var x0=null,y0=0;
  drawer.addEventListener("touchstart",function(e){var t=e.touches[0];x0=t.clientX;y0=t.clientY;},{passive:true});
  drawer.addEventListener("touchend",function(e){if(x0==null) return;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(dx<-60&&Math.abs(dy)<Math.abs(dx)*.6) closeMenu(true);},{passive:true});
})();
/* Réglages du menu : thème et minuteur automatique */
var LS_THEME="carnet62.theme",LS_AUTO="carnet62.autorest",autoRest=lsGet(LS_AUTO)!==false;
function getTheme(){try{var t=localStorage.getItem(LS_THEME);return (t==="light"||t==="dark")?t:"auto";}catch(e){return "auto";}}
function applyTheme(){var t=getTheme(),r=document.documentElement;if(t==="auto") r.removeAttribute("data-theme");else r.setAttribute("data-theme",t);
  [].forEach.call(document.querySelectorAll("[data-theme-set]"),function(b){b.setAttribute("aria-pressed",b.dataset.themeSet===t?"true":"false");});}
function setTheme(t){try{if(t==="auto") localStorage.removeItem(LS_THEME);else localStorage.setItem(LS_THEME,t);}catch(e){}applyTheme();}
var arEl=document.getElementById("autoRest");arEl.checked=autoRest;
arEl.addEventListener("change",function(){autoRest=arEl.checked;lsSet(LS_AUTO,autoRest);});
[].forEach.call(document.querySelectorAll("[data-ic]"),function(el){el.innerHTML=ico(el.dataset.ic,+el.dataset.sz||20,1.9);});
applyTheme();
/* Minuteur automatique : une série notée (case vide qui se remplit) lance le repos de l'exercice */
main.addEventListener("focusin",function(e){var t=e.target;if(t.classList&&t.classList.contains("in-set")) t.dataset.was=t.value;});
main.addEventListener("change",function(e){
  var t=e.target;if(!autoRest||!t.classList||!t.classList.contains("in-set")) return;
  if((t.dataset.was||"")!==""||!String(t.value).trim()) return;
  var card=t.closest("[data-ex]");if(!card) return;
  var ex=ALLEX[card.dataset.ex],btn=card.querySelector(".rest:not([data-emom])");if(!btn) return;
  var ins=card.querySelectorAll(".in-set");
  if(ins[ins.length-1]===t&&!(ex&&ex.ss)) return;
  t.dataset.was=t.value;
  startTimer(+btn.dataset.rest,btn.dataset.label||"Repos",false);
});

function goTab(t){state.tab=t;try{history.replaceState(null,"","#"+t);}catch(e){}render();window.scrollTo(0,0);closeMenu();}
function goWeek(n){state.week=Math.max(FIRST,n);expandWeeks(state.week);render();}
document.addEventListener("click",function(e){
  var b=e.target.closest("button,[data-tab]");if(!b) return;
  if(b.id==="menuBtn"){openMenu();return;}
  if(b.id==="menuClose"){closeMenu(true);return;}
  if(b.dataset.themeSet){setTheme(b.dataset.themeSet);return;}
  if(b.dataset.tab){goTab(b.dataset.tab);return;}
  if(b.dataset.liveStart){saveLive({week:state.week,sid:b.dataset.liveStart,index:0});goTab("live");return;}
  if(b.dataset.liveAction){liveAction(b.dataset.liveAction);return;}
  if(b.dataset.week){goWeek(+b.dataset.week);return;}
  if(b.dataset.rest){startTimer(+b.dataset.rest,b.dataset.label||"Repos",!!b.dataset.emom);return;}
  if(b.dataset.act==="export"){exportJSON();return;}
  if(b.dataset.act==="csv"){exportCSV();return;}
  if(b.dataset.act==="gh-on"){ghConnect();return;}
  if(b.dataset.act==="gh-sync"){ghSync(true);return;}
  if(b.dataset.act==="gh-off"){ghDisconnect();return;}
  if(b.dataset.act==="upd"){forceUpdate();return;}
  if(b.dataset.act==="imp-merge"){applyImport("merge");return;}
  if(b.dataset.act==="imp-replace"){applyImport("replace");return;}
  if(b.dataset.act==="undo"){undoImport();return;}
  if(b.dataset.act==="imp-cancel"){importing=null;render();return;}
  if(b.dataset.act==="cues"){state.cues=!state.cues;lsSet(LS_CUES2,state.cues);Object.keys(state.open).forEach(function(k){if(/^(c|wm)-/.test(k)) delete state.open[k];});render();return;}
  if(b.id==="wkPrev"){goWeek(state.week-1);return;}
  if(b.id==="wkNext"){goWeek(state.week+1);return;}
  if(b.id==="tPlus"){addTime();return;}
  if(b.id==="tSnd"){sndOn=!sndOn;lsSet(LS_SND,sndOn);sndUI();if(sndOn){audio();play(SND_MIN);}return;}
  if(b.id==="tStop"){stopTimer();return;}
});

/* ---------- Minuteur ---------- */
/* Son : jeu de bips généré par le navigateur (rien à télécharger). Il retentit à la fin du repos, par un décompte
   sur les 3 dernières secondes, et à chaque minute d'un EMOM. Le bouton cloche le coupe ; la vibration reste. */
var LS_SND="carnet62.snd",sndOn=lsGet(LS_SND)!==false;
var timer={end:0,total:0,iv:null,emom:false,lastMin:0,lastTick:0},actx=null,wl=null;
var tEl=document.getElementById("timer"),tTime=document.getElementById("tTime"),tLabel=document.getElementById("tLabel"),tFill=document.getElementById("tFill"),tSnd=document.getElementById("tSnd");
var SND_END=[[0,880,.18,.55],[.26,880,.18,.55],[.52,1320,.5,.55],[1.25,880,.18,.55],[1.51,880,.18,.55],[1.77,1320,.5,.55]];
var SND_MIN=[[0,1100,.22,.45]],SND_TICK=[[0,740,.09,.32,"sine"]];
function sndUI(){tSnd.setAttribute("aria-pressed",sndOn?"true":"false");tSnd.setAttribute("aria-label","Son du minuteur : "+(sndOn?"activé":"coupé"));}
function audio(){try{if(!actx){var AC=window.AudioContext||window.webkitAudioContext;if(AC) actx=new AC();}if(actx&&actx.state!=="running") actx.resume();if(navigator.audioSession) navigator.audioSession.type="playback";}catch(e){}}
function tone(t,f,d,v,type){var o=actx.createOscillator(),g=actx.createGain();o.type=type||"triangle";o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.015);g.gain.setValueAtTime(v,Math.max(t+0.016,t+d-0.05));g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+0.03);}
function play(seq){if(!sndOn||!actx) return;try{var t=actx.currentTime+0.03;seq.forEach(function(x){tone(t+x[0],x[1],x[2],x[3],x[4]);});}catch(e){}}
function lock(){try{if(navigator.wakeLock&&!wl){navigator.wakeLock.request("screen").then(function(l){wl=l;l.addEventListener("release",function(){wl=null;});},function(){});}}catch(e){}}
function unlock(){try{if(wl){wl.release();wl=null;}}catch(e){}}
function startTimer(sec,label,emom){audio();lock();timer.end=Date.now()+sec*1000;timer.total=sec;timer.emom=emom;timer.lastMin=0;timer.lastTick=0;tLabel.textContent=label;tEl.hidden=false;tEl.classList.remove("end");clearInterval(timer.iv);timer.iv=setInterval(tick,250);tick();}
function addTime(){
  /* +15 s : prolonge le repos en cours, ou le relance s'il vient de se terminer */
  audio();lock();
  if(timer.iv){timer.end+=15000;timer.total+=15;}
  else{timer.end=Date.now()+15000;timer.total=15;timer.emom=false;timer.lastMin=0;}
  timer.lastTick=0;tEl.classList.remove("end");
  if(!timer.iv) timer.iv=setInterval(tick,250);
  tick();
}
function tick(){
  var leftMs=timer.end-Date.now(),left=Math.max(0,Math.ceil(leftMs/1000));
  tTime.textContent=mmss(left);
  tFill.style.width=Math.min(100,100*(1-left/Math.max(1,timer.total)))+"%";
  if(leftMs>0){
    if(timer.emom){var el=Math.floor((timer.total-left)/60);if(el>timer.lastMin){timer.lastMin=el;play(SND_MIN);}}
    else if(timer.total>=10&&left<=3&&left!==timer.lastTick){timer.lastTick=left;play(SND_TICK);}
    return;
  }
  clearInterval(timer.iv);timer.iv=null;tEl.classList.add("end");tTime.textContent=timer.emom?"Terminé":"C’est reparti";
  audio();play(SND_END);
  try{if(navigator.vibrate) navigator.vibrate([200,100,200,100,400]);}catch(e){}
  unlock();
}
function stopTimer(){clearInterval(timer.iv);timer.iv=null;tEl.hidden=true;tEl.classList.remove("end");unlock();}
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&timer.iv){wl=null;lock();tick();}});
sndUI();

/* ---------- En-tête rétractable (téléphone et tablette tactile) ----------
   On descend dans la page : la semaine et les onglets se rangent pour laisser la place. On remonte un peu : ils reviennent.
   Sur ordinateur, ils restent dans la barre latérale. */
(function(){
  var hdr=document.getElementById("bar"),mq=window.matchMedia("(max-width:1023px) and (pointer:coarse)"),lastY=window.pageYOffset||0,acc=0,hid=false;
  function set(v){if(v===hid) return;hid=v;hdr.classList.toggle("hide",v);}
  window.addEventListener("scroll",function(){
    if(!mq.matches){acc=0;set(false);return;}
    var max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight),y=Math.min(max,Math.max(0,window.pageYOffset||0)),dy=y-lastY;lastY=y;
    if(y<=hdr.offsetHeight){acc=0;set(false);return;}
    if(dy===0) return;
    if((dy>0)!==(acc>0)) acc=0;
    acc+=dy;
    if(acc>18) set(true);else if(acc<-8) set(false);
  },{passive:true});
  hdr.addEventListener("focusin",function(){set(false);});
  if(mq.addEventListener) mq.addEventListener("change",function(){set(false);});
})();

document.addEventListener("visibilitychange",function(){
  if(!ghOn()) return;
  if(document.visibilityState==="hidden"){if(ghSt.dirtyAt>ghSt.okAt) ghSync(false);}
  else if(Date.now()-ghSt.lastTry>15000) ghSync(false);
});
window.addEventListener("online",function(){if(ghOn()) ghSync(false);});
window.addEventListener("focus",function(){if(ghOn()&&Date.now()-ghSt.lastTry>60000) ghSync(false);});
setInterval(function(){if(ghOn()&&document.visibilityState==="visible"&&Date.now()-ghSt.lastTry>180000) ghSync(false);},60000);
ensureHistory();document.getElementById("bld").textContent="b"+BUILD;render();setSync();
if(ghOn()) ghAutoSoon(1200);
})();
