/* Menu + customization data (demo — confirm items & prices with the owner) */
window.LC_DATA = (function(){
const c=(id,es,en,p)=>({id,es,en,p:p||0});
const G = {
  sides3:{es:"Elige 3 acompañantes",en:"Pick 3 sides",min:3,max:3,def:["gallo","tajadas","queso"],choices:[
    c("gallo","Gallo pinto","Gallo pinto"),c("tajadas","Tajadas verdes","Green plantain chips"),c("maduro","Maduro","Sweet plantain"),
    c("queso","Queso frito","Fried cheese"),c("ensalada","Ensalada de repollo","Cabbage salad"),c("tortilla","Tortilla a mano","Handmade tortilla"),
    c("crema","Crema","Nica cream"),c("arroz","Arroz blanco","White rice"),c("frijoles","Frijoles molidos","Refried beans")]},
  rice:{es:"¿Cuánto gallo pinto?",en:"How much gallo pinto?",min:1,max:1,def:["normal"],choices:[
    c("poco","Poquito","Light"),c("normal","Normal","Regular"),c("extra","Extra","Extra",2)]},
  salsas:{es:"Salsas y encurtidos",en:"Sauces & pickles",min:0,max:4,def:["chilero"],choices:[
    c("chilero","Chilero","Chilero (hot pickled onion)"),c("cebolla","Cebolla encurtida","Pickled onion"),c("pico","Pico de gallo","Pico de gallo"),c("cremax","Crema extra","Extra cream",1)]},
  extras:{es:"¿Algo más?",en:"Add extras",min:0,max:6,def:[],choices:[
    c("xqueso","Queso frito extra","Extra fried cheese",3),c("xmaduro","Maduro extra","Extra sweet plantain",3),c("xchorizo","Chorizo","Chorizo",5),
    c("xcarne","Carne asada extra","Extra carne asada",8),c("xpollo","Pollo extra","Extra chicken",6),c("xtortilla","Tortilla extra","Extra tortilla",1),c("xaguacate","Aguacate","Avocado",2)]},
  proteins2:{es:"Elige 2 carnes",en:"Pick 2 meats",min:2,max:2,def:["carne","pollo"],choices:[
    c("carne","Carne asada","Carne asada"),c("pollo","Pollo asado","Grilled chicken"),c("cerdo","Cerdo asado","Grilled pork"),c("chorizo","Chorizo","Chorizo"),c("lengua","Lengua","Beef tongue",3)]},
  eggs:{es:"¿Cómo quieres los huevos?",en:"How do you want your eggs?",min:1,max:1,def:["revueltos"],choices:[
    c("revueltos","Revueltos","Scrambled"),c("estrellados","Estrellados","Sunny side up"),c("ranchera","Con tomate y cebolla","With tomato & onion")]},
  bmeat:{es:"Elige tu carne",en:"Choose your meat",min:1,max:1,def:["carne"],choices:[
    c("carne","Carne asada","Carne asada"),c("pollo","Pollo asado","Grilled chicken"),c("chorizo","Chorizo","Chorizo")]},
  coffee:{es:"¿Le agregas bebida?",en:"Add a drink?",min:1,max:1,def:["none"],choices:[
    c("none","Sin bebida","No drink"),c("cafe","Café","Coffee",2),c("cacao","Cacao","Cacao",4),c("pinolillo","Pinolillo","Pinolillo",4)]},
  cook:{es:"Término",en:"Doneness",min:1,max:1,def:["34"],choices:[
    c("medio","Término medio","Medium"),c("34","Tres cuartos","Medium well"),c("bien","Bien cocido","Well done")]},
  soupside:{es:"Acompañante",en:"Side",min:1,max:1,def:["tortilla"],choices:[c("tortilla","Tortilla a mano","Handmade tortilla"),c("arroz","Arroz blanco","White rice")]},
  size:{es:"Tamaño",en:"Size",min:1,max:1,def:["m"],choices:[c("m","Mediano","Medium"),c("g","Grande","Large",1.5),c("xg","Extra grande","Extra large",3)]},
  sweet:{es:"Dulce",en:"Sweetness",min:1,max:1,def:["normal"],choices:[c("normal","Normal","Regular"),c("menos","Menos azúcar","Less sugar"),c("sin","Sin azúcar","No sugar")]},
  soda:{es:"Sabor",en:"Flavor",min:1,max:1,def:["coca"],choices:[c("coca","Coca-Cola","Coca-Cola"),c("rojita","Rojita","Rojita"),c("shaler","Kola Shaler","Kola Shaler"),c("fanta","Fanta Naranja","Orange Fanta")]},
  soda3:{es:"Refresco de 3 litros",en:"3-liter soda",min:1,max:1,def:["coca"],choices:[c("coca","Coca-Cola","Coca-Cola"),c("fanta","Fanta Naranja","Orange Fanta"),c("sprite","Sprite","Sprite")]},
  plate:{es:"Acompañantes del platón",en:"Platter sides",min:0,max:9,def:["gallo","tajadas","queso","maduro","enchilada","taco","ensalada"],choices:[
    c("gallo","Gallo pinto","Gallo pinto"),c("tajadas","Tajadas","Plantain chips"),c("queso","Queso frito","Fried cheese"),c("maduro","Maduro","Sweet plantain"),
    c("enchilada","Enchilada","Enchilada"),c("taco","Taco nica","Nica taco"),c("ensalada","Ensalada","Salad")],hint:{es:"Quita lo que no quieras",en:"Remove anything you don't want"}}
};
const CATS=[
  {id:"fritanga",es:"Fritanga",en:"Fritanga",art:"steak",note:{es:"Platos con 3 acompañantes",en:"Plates come with 3 sides"}},
  {id:"compartir",es:"Para compartir",en:"To share",art:"cajita",note:{es:"Platones para la mesa",en:"Platters for the table"}},
  {id:"desayunos",es:"Desayunos",en:"Breakfast",art:"tortilla",note:{es:"Servidos todo el día",en:"Served all day"}},
  {id:"sopas",es:"Sopas",en:"Soups",art:"soup",note:{es:"Caseras, a fuego lento",en:"Homemade, slow-simmered"}},
  {id:"bebidas",es:"Refrescos",en:"Drinks",art:"drink",note:{es:"Naturales, hechos en casa",en:"Natural, made in house"}},
  {id:"postres",es:"Postres",en:"Desserts",art:"bunuelo",note:{es:"El toque dulce",en:"Something sweet"}}
];
const plate=["sides3","rice","salsas","extras"];
const I=(id,cat,es,en,des,den,price,opts,o)=>Object.assign({id,cat,es,en,des,den,price,opts:opts||[]},o||{});
const ITEMS=[
  I("carne-asada","fritanga","Asado de Res","Beef Asado","Carne de res asada a la parrilla, fina y marinada al estilo chontaleño.","Thin-cut grilled beef, marinated the Chontales way.",24.5,plate,{tag:{es:"De la casa",en:"Signature"},art:"plate"}),
  I("asado-mixto","fritanga","Asado Mixto","Mixed Grill","Elige 2 carnes a la parrilla con tus acompañantes.","Pick 2 grilled meats with your sides.",26,["proteins2","sides3","rice","salsas","extras"],{art:"steak"}),
  I("pollo-asado","fritanga","Asado de Pollo","Chicken Asado","Pollo adobado a la parrilla, jugoso y ahumado.","Marinated grilled chicken, juicy and smoky.",22,plate,{art:"plate"}),
  I("cerdo-asado","fritanga","Cerdo Asado","Grilled Pork","Cerdo adobado en naranja agria y achiote.","Pork marinated in sour orange and achiote.",18,plate,{art:"plate"}),
  I("chorizo","fritanga","Chorizo Asado","Grilled Chorizo","Chorizo a la parrilla, doradito y jugoso.","Grilled chorizo, crispy and juicy.",16,plate,{art:"steak"}),
  I("lengua","fritanga","Lengua en Salsa","Beef Tongue in Sauce","Lengua tiernita en salsa criolla de la casa.","Tender tongue in our house tomato sauce.",19,plate,{art:"soup"}),
  I("enchiladas","fritanga","Enchiladas Nicas","Nica Enchiladas","Orden de 2. Tortilla dorada rellena de arroz y carne, con ensalada.","Order of 2. Crispy tortilla stuffed with rice and meat, with salad.",15,["salsas","extras"],{art:"tortilla"}),
  I("tacos","fritanga","Tacos de Pollo","Chicken Tacos","Tacos nicas de pollo, enrollados y fritos, con repollo, crema y queso.","Rolled, fried Nica chicken tacos with cabbage, cream and cheese.",15,["salsas","extras"],{art:"tortilla"}),
  I("papas","fritanga","Papas Rellenas","Stuffed Potatoes","Croquetas doradas de papa rellenas de carne sazonada.","Golden potato croquettes filled with seasoned meat.",15,["salsas","extras"],{art:"bunuelo"}),
  I("tajadas-queso","fritanga","Tajadas con Queso","Plantain Chips & Cheese","Canastita de tajadas verdes con queso frito y repollo.","A basket of green plantain chips with fried cheese and cabbage.",9,["salsas","extras"],{art:"cajita"}),
  I("maduro-queso","fritanga","Maduro con Queso","Sweet Plantain & Cheese","Maduro y queso frito — sencillo y perfecto.","Sweet plantain and fried cheese — simple and perfect.",9,["extras"],{art:"plate"}),
  I("chontaleno","compartir","El Chontaleño","El Chontaleño","La bandeja de la casa: pollo, cerdo y res asada, chorizo asado, enchiladas, tacos, tajadas, queso frito, maduro, gallo pinto, ensalada y chilero.","The house platter: grilled chicken, pork and beef, grilled chorizo, enchiladas, tacos, plantain chips, fried cheese, sweet plantain, gallo pinto, salad and chilero.",32,["proteins2","plate","salsas","extras"],{tag:{es:"El más pedido",en:"Most ordered"},img:"media/bowl-sq.jpg"}),
  I("caballo-bayo","compartir","Caballo Bayo","Caballo Bayo","El platón familiar para 5 en hoja de chagüite: un poquito de todo, con refresco de 3 litros.","The family platter for 5 on banana leaf: a little of everything, with a 3-liter soda.",145,["plate","soda3","salsas","extras"],{tag:{es:"Para 5",en:"Serves 5"},img:"media/leaf-sq.jpg"}),
  I("tomahawk","compartir","Tomahawk Nica","Nica Tomahawk","Tomahawk gigante de res nicaragüense con 3 acompañantes.","A giant tomahawk of Nicaraguan beef with 3 sides.",70,["cook","sides3","salsas"],{art:"steak"}),
  I("desayuno-nica","desayunos","Desayuno Nica","Nica Breakfast","Gallo pinto, huevos, queso frito, maduro, crema y tortillas hechas a mano.","Gallo pinto, eggs, fried cheese, sweet plantain, cream and handmade tortillas.",14,["eggs","rice","coffee","extras"],{art:"tortilla"}),
  I("desayuno-ranchero","desayunos","Desayuno Ranchero","Ranch Breakfast","Todo lo del desayuno nica, más tu carne favorita.","Everything in the Nica breakfast plus your favorite meat.",17,["bmeat","eggs","rice","coffee","extras"],{art:"plate"}),
  I("nacatamal","desayunos","Nacatamal para Llevar","Nacatamal to Go","Masa de maíz con cerdo, arroz y papa, envuelto en hoja de chagüite.","Corn masa with pork, rice and potato, wrapped in banana leaf.",13,["coffee"],{days:[6,0],art:"nacatamal"}),
  I("tortillas","desayunos","Tortillas a Mano","Handmade Tortillas","Recién salidas del comal. Orden de tres.","Fresh off the comal. Order of three.",3,[],{art:"tortilla"}),
  I("sopa-costilla","sopas","Sopa de Costilla","Beef Rib Soup","Costilla de res, yuca, plátano, elote y verduras.","Beef rib, yuca, plantain, corn and vegetables.",16,["soupside"],{art:"soup"}),
  I("sopa-mondongo","sopas","Sopa de Mondongo","Tripe Soup","La sopa tradicional, cocida por horas.","The traditional soup, slow-cooked for hours.",16,["soupside"],{art:"soup",soldOut:true}),
  I("cacao","bebidas","Cacao","Cocoa","Cacao frío con leche y canela. Mediano, grande o extra grande.","Cold cocoa drink with milk and cinnamon. Medium, large or extra large.",8.5,["size","sweet"],{art:"drink"}),
  I("jicaro","bebidas","Semilla de Jícaro","Jicaro Seed","Bebida tradicional de semilla de jícaro con leche.","Traditional drink made from jicaro seeds and milk.",8.5,["size","sweet"],{art:"drink"}),
  I("chia-tamarindo","bebidas","Chía con Tamarindo","Tamarind Chia","Refresco de tamarindo con semillas de chía.","Tamarind drink with chia seeds.",6.5,["size","sweet"],{art:"drink"}),
  I("chicha","bebidas","Chicha","Chicha","Refresco de maíz, la rosadita de siempre.","Sweet corn drink, the classic pink one.",6.5,["size","sweet"],{art:"drink"}),
  I("arroz-pina","bebidas","Arroz con Piña","Rice & Pineapple","Cremoso, dulce y refrescante.","Creamy, sweet and refreshing.",5,["size","sweet"],{art:"drink"}),
  I("granadilla","bebidas","Granadilla","Granadilla","Refresco natural de granadilla.","Fresh granadilla drink.",5,["size","sweet"],{art:"drink"}),
  I("pinolillo","bebidas","Pinolillo","Pinolillo","Maíz tostado y cacao — la bebida de los nicas.","Toasted corn and cacao — the drink of the nicas.",5,["size","sweet"],{art:"drink"}),
  I("gaseosa","bebidas","Gaseosa","Soda","Fría, de lata o botella.","Ice cold, can or bottle.",3,["soda"],{art:"drink"}),
  I("pio-quinto","postres","Pío Quinto","Pío Quinto","Bizcocho borracho con natilla y canela.","Rum-soaked cake with custard and cinnamon.",7,[],{art:"bunuelo"}),
  I("arroz-leche","postres","Arroz con Leche","Rice Pudding","Cremosito, con canela y pasas.","Creamy, with cinnamon and raisins.",6,[],{art:"bunuelo"}),
  I("bunuelos","postres","Buñuelos","Buñuelos","Buñuelos de yuca bañados en miel caliente.","Yuca fritters bathed in warm honey syrup.",7,[],{art:"bunuelo"})
];
const SOCIAL={tiktok:"https://www.tiktok.com/@el_rey_fritanguero_nica",instagram:"https://www.instagram.com/fritangas_managuitas_usa",facebook:"https://www.facebook.com/share/1F8cXYR9hw/"};
const CLUB={goal:10,reward:15};
return {G,CATS,ITEMS,TAX:0.07,SOCIAL,CLUB};
})();
