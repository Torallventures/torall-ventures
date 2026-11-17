/* Menu + customization data (demo — confirm items & prices with the owner) */
window.LC_DATA = (function(){
const c=(id,es,en,p)=>({id,es,en,p:p||0});
const G = {
  sides:{es:"Acompañantes recomendados",en:"Recommended sides",min:0,max:5,def:[],choices:[
    c("queso","Queso frito","Fried cheese",4),c("maduro","Tajadas maduras","Ripe plantains",4.5),c("gallo","Gallo pinto","Gallo pinto",5.5),
    c("tortillas","Tortillas x2","Tortillas x2",4.5),c("verdequeso","Tajadas verdes con queso","Green plantains with cheese",15)]},
  drinks:{es:"¿Algo de tomar?",en:"Add a drink?",min:0,max:5,def:[],choices:[
    c("cacao","Cacao","Cocoa",8.5),c("coca","Coca lata","Canned Coke",3),c("chicha","Chicha","Chicha",6.5),c("jicaro","Semilla de jícaro","Jicaro seed",8.5),c("chia","Chía con tamarindo","Tamarind chia",6.5)]},
  size:{es:"Tamaño",en:"Size",min:1,max:1,def:["m"],choices:[c("m","Mediano","Medium"),c("g","Grande","Large",1.5),c("xg","Extra grande","Extra large",3)]}
};
const CATS=[
  {id:"asados",es:"Platos Fuertes",en:"Heavy Dishes",art:"steak",note:{es:"Con gallo pinto, tajadas, queso frito y ensalada",en:"With gallo pinto, plantains, fried cheese and salad"}},
  {id:"antojitos",es:"Antojitos Nicas",en:"Nica Cravings",art:"tortilla",note:{es:"Los clásicos de la fritanga",en:"Fritanga classics"}},
  {id:"domingos",es:"Domingos y Sopa",en:"Sundays & Soup",art:"soup",note:{es:"Especiales de la casa",en:"House specials"}},
  {id:"naturales",es:"Bebidas Naturales",en:"Natural Drinks",art:"drink",note:{es:"Mediano, grande o extra grande",en:"Medium, large or extra large"}},
  {id:"sodas",es:"Gaseosas",en:"Sodas",art:"drink",note:{es:"Bien frías",en:"Ice cold"}},
  {id:"extras",es:"Extras",en:"Extras",art:"plate",note:{es:"Para completar tu plato",en:"Round out your plate"}}
];
const plate=["sides","drinks"];
const I=(id,cat,es,en,des,den,price,opts,o)=>Object.assign({id,cat,es,en,des,den,price,opts:opts||[]},o||{});
const img=n=>"media/menu/"+n+".jpg";
const ITEMS=[
  I("asado-res","asados","Asado de Res","Beef Asado","Carne asada de res a la parrilla con gallo pinto (arroz y frijoles mixtos), tajadas, queso frito y ensalada.","Grilled beef with gallo pinto, plantain chips, fried cheese and salad.",24,plate,{tag:{es:"Más pedido",en:"Most ordered"},img:img("asado-res")}),
  I("asado-pollo","asados","Asado de Pollo","Chicken Asado","Pollo asado marinado en cítricos y ajo, con gallo pinto, maduro, queso frito y ensalada.","Grilled chicken marinated in citrus and garlic, with gallo pinto, sweet plantain, fried cheese and salad.",22,plate,{tag:{es:"Más pedido",en:"Most ordered"},img:img("asado-pollo")}),
  I("asado-cerdo","asados","Asado de Cerdo","Pork Asado","Cerdo asado lentamente, marinado en cítricos y ajo, con gallo pinto, tajadas, queso frito y ensalada.","Slow-roasted pork marinated in citrus and garlic, with gallo pinto, plantain chips, fried cheese and salad.",22,plate,{img:img("asado-cerdo")}),
  I("asado-mixto","asados","Asado Mixto","Mixed Asado","Res, chuleta de cerdo y pollo a la parrilla, con frijoles, queso, repollo, chimol, encurtido y aguacate.","Grilled beef, pork chop and chicken with beans, cheese, cabbage, chimol, pickles and avocado.",22.5,plate,{art:"steak"}),
  I("tajadas-res","asados","Tajadas con Res","Plantains with Beef","Tajadas verdes con carne de res, ensalada de repollo y encurtido.","Green plantain chips with beef, cabbage salad and pickled onion.",20,plate,{art:"plate"}),
  I("tajadas-cerdo","asados","Tajadas con Cerdo","Plantains with Pork","Tajadas con cerdo, ensalada de repollo y encurtido.","Plantain chips with pork, cabbage salad and pickled onion.",19.5,plate,{art:"plate"}),
  I("tajadas-pollo","asados","Tajadas con Pollo","Plantains with Chicken","Tajadas verdes o maduras, pollo asado, queso frito, ensalada de repollo y encurtido.","Green or ripe plantains, grilled chicken, fried cheese, cabbage salad and pickled onion.",18.5,plate,{art:"plate"}),
  I("enchiladas","antojitos","Enchiladas de Res","Beef Enchiladas","Tortillas rellenas de carne molida, con ensalada de repollo y chilero.","Tortillas filled with ground beef, topped with cabbage salad and chilero.",16.5,["drinks"],{img:img("enchiladas")}),
  I("tacos-res","antojitos","Tacos de Res","Beef Tacos","Tacos nicas de res, enrollados y fritos, con repollo, crema y salsa.","Rolled, fried Nica beef tacos with cabbage, cream and sauce.",16.5,["drinks"],{tag:{es:"Más pedido",en:"Most ordered"},img:img("tacos")}),
  I("tacos-pollo","antojitos","Tacos de Pollo","Chicken Tacos","Tacos nicas de pollo, enrollados y fritos, con repollo, crema y salsa.","Rolled, fried Nica chicken tacos with cabbage, cream and sauce.",15,["drinks"],{img:img("tacos")}),
  I("quesillo","antojitos","Quesillo","Quesillo","Tortilla suave con quesillo, crema y cebolla encurtida.","Soft corn tortilla with fresh quesillo cheese, cream and pickled onion.",14.5,["drinks"],{img:img("quesillo")}),
  I("nacatamal","antojitos","Nacatamal para Llevar","Nacatamal to Go","Nacatamal tradicional envuelto en hoja de plátano, para llevar.","Traditional nacatamal wrapped in banana leaf, to go.",13,["drinks"],{img:img("nacatamal")}),
  I("nacatamal-servido","antojitos","Nacatamal Servido","Served Nacatamal","Masa de maíz con carne y verduras, cocida en hoja de plátano, servido con pan y café.","Corn dough with meat and vegetables steamed in banana leaf, served at the table.",16,["drinks"],{art:"nacatamal"}),
  I("maduro-queso","antojitos","Tajadas Maduras con Queso","Ripe Plantains with Cheese","Maduro frito con queso.","Fried ripe plantains with cheese.",15,["drinks"],{art:"plate"}),
  I("verde-queso","antojitos","Tajadas Verdes con Queso","Green Plantains with Cheese","Tajadas verdes fritas con queso.","Fried green plantain chips with cheese.",15,["drinks"],{art:"cajita"}),
  I("vaho","domingos","Vaho","Steamed Beef Brisket","Carne de pecho de res y verduras, cocinados al vapor en hoja de plátano. Solo los domingos.","Beef brisket and vegetables steamed in banana leaf. Sundays only.",23,["drinks"],{days:[0],art:"nacatamal"}),
  I("sopa-dia","domingos","Sopa del Día","Soup of the Day","Casi siempre es sopa de costilla de res, pero a veces varía. Llama para saber cuál está hoy.","Usually beef rib soup, but it varies. Call to ask today's soup.",25.3,["drinks"],{art:"soup"}),
  I("chicha","naturales","Chicha","Chicha","Bebida tradicional de maíz.","Traditional corn drink.",6.5,["size"],{img:img("chicha")}),
  I("chia-tamarindo","naturales","Chía con Tamarindo","Tamarind Chia","Refresco de tamarindo con semillas de chía.","Tamarind drink with chia seeds.",6.5,["size"],{art:"drink"}),
  I("jamaica","naturales","Jamaica","Hibiscus","Refresco de flor de jamaica.","Refreshing hibiscus flower drink.",6.5,["size"],{art:"drink"}),
  I("arroz-pina","naturales","Arroz con Piña","Rice & Pineapple","Refresco de arroz con piña.","Rice and pineapple drink.",6.5,["size"],{art:"drink"}),
  I("cacao","naturales","Cacao","Cocoa","Cacao cremoso y bien frío.","Rich, cold cocoa drink.",8.5,["size"],{tag:{es:"Más pedido",en:"Most ordered"},img:img("cacao")}),
  I("jicaro","naturales","Semilla de Jícaro","Jicaro Seed","Bebida tradicional de semilla de jícaro.","Traditional jicaro seed drink.",8.5,["size"],{img:img("jicaro")}),
  I("coca-lata","sodas","Coca Lata","Canned Coke","Coca-Cola en lata.","Canned Coca-Cola.",3,[],{art:"drink"}),
  I("milca","sodas","Milca Lata","Canned Milca","La gaseosa nica en lata.","Nicaraguan Milca soda, canned.",4.5,[],{art:"drink"}),
  I("coca-nica","sodas","Coca Cola Nica 16 oz","Nica Coca-Cola 16 oz","Coca-Cola de Nicaragua.","Coca-Cola from Nicaragua.",6,[],{art:"drink"}),
  I("kola-champagne","sodas","Kola Champagne","Kola Champagne","Gaseosa sabor champagne.","Cream-soda style kola.",3,[],{art:"drink"}),
  I("agua","sodas","Agua Botella","Bottled Water","Agua en botella.","Bottled water.",3,[],{art:"drink"}),
  I("rojita","sodas","Rojita 16 oz","Rojita 16 oz","La gaseosa roja nica.","The classic red Nica soda.",6,[],{art:"drink"}),
  I("kola-shaler","sodas","Kola Shaler 16 oz","Kola Shaler 16 oz","Gaseosa nicaragüense tradicional.","Traditional Nicaraguan soda.",6,[],{art:"drink"}),
  I("x-cerdo","extras","Extra Cerdo Asado","Extra Pork Asado","Porción extra de cerdo asado.","Extra portion of roast pork.",8.5,[],{art:"steak"}),
  I("x-pollo","extras","Extra Pollo Asado","Extra Chicken Asado","Porción extra de pollo asado.","Extra portion of grilled chicken.",8.5,[],{art:"steak"}),
  I("x-res","extras","Extra Res Asado","Extra Beef Asado","Porción extra de res asada.","Extra portion of grilled beef.",10.5,[],{art:"steak"}),
  I("x-queso","extras","Queso Frito","Fried Cheese","Queso blanco frito.","Fried white cheese.",4,[],{art:"plate"}),
  I("x-gallo","extras","Gallo Pinto","Gallo Pinto","Arroz con frijoles.","Rice and beans.",5.5,[],{art:"plate"}),
  I("x-maduro","extras","Tajadas Maduras","Ripe Plantains","Maduro frito.","Fried ripe plantains.",4.5,[],{art:"plate"}),
  I("x-verde","extras","Tajadas Verdes","Green Plantains","Tajadas verdes crujientes.","Crispy green plantain chips.",4.5,[],{art:"cajita"}),
  I("x-tortillas","extras","Tortillas x2","Tortillas x2","Dos tortillas de maíz hechas a mano.","Two handmade corn tortillas.",4.5,[],{art:"tortilla"}),
  I("x-ensalada","extras","Ensalada","Salad","Lechuga, tomate, cebolla y pepino.","Lettuce, tomato, onion and cucumber.",3,[],{art:"plate"})
];
const SOCIAL={tiktok:"https://www.tiktok.com/@el_rey_fritanguero_nica",instagram:"https://www.instagram.com/fritangas_managuitas_usa",facebook:"https://www.facebook.com/share/1F8cXYR9hw/"};
const CLUB={goal:10,reward:15};
return {G,CATS,ITEMS,TAX:0.07,SOCIAL,CLUB};
})();
