(function () {
  'use strict';

  angular
    .module('app')
    .factory('MineralsFactory', MineralsFactory);
 
  function MineralsFactory() {

    var mineralsInfoDescriptions =
    [
      {
        "Name": "actinolite",
        "Mineral": "Actinolite",
        "Formula": "Ca2(Mg,Fe)5Si8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Good cleavage at 56o and 124o. Elongate, prismatic crystal habit, sometimes fibrous. Gray green to bright green color due to even minor presence of Fe. White color indicates a mineral is most likely tremolite.",
        "Occurrence": "Moderately high T and P conditions in the presence of water, contact metamorphosed rocks, marbles, gneisses and schist with serpentines, granites.   Often compact masses of slender crystals. Sometimes found as hair-like inclusions in quartz crystals. Common in mafic and ultramafic igneous rocks, metagraywacke, or blueschist.",
        "Associated Minerals": "Dolomite, forsterite, garnet, diopside, wollastonite. Alters to talc, chlorite, epidote, and calcite.",
        "": ""
      },
      {
        "Name": "albite",
        "Mineral": "Albite",
        "Formula": "NaAlSi3O8",
        "Crystal System": "Triclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (nearly 90o), parallel striations, most commonly a gray-white color. Pearly luster.",
        "Occurrence": "Common in pegmatites, veins, and schists. Found in some limestones. Pervasive along feldspar contacts in granites and granodiorites.",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "": ""
      },
      {
        "Name": "andalusite",
        "Mineral": "Andalusite",
        "Formula": "Al2SiO5",
        "Crystal System": "Orthorhombic",
        "Hardness": "6.5-7.5",
        "Distinguishing Features": "Forms as square to elongate prismatic porphyroblasts or as irregular masses. Uncolored streak. Frequently riddled with quartz inclusions.",
        "Occurrence": "Low to medium T, low P metamorphic rocks (e.g. medium-grade mica schist). Contacts between igneous rocks and shales.",
        "Associated Minerals": "Garnet, muscovite, biotite, hornblende, quartz. Readily alters to sericite.",
        "": ""
      },
      {
        "Name": "anhydrite",
        "Mineral": "Anhydrite",
        "Formula": "CaSO4",
        "Crystal System": "Orthorhombic",
        "Hardness": "3-3.5",
        "Distinguishing Features": "Cubic cleavage, vitreous to pearly luster, uneven to splintery fracture. Colorless, but often exhibits a blue, reddish, or purple hue.",
        "Occurrence": "Marine evaporite deposits, hydrothermally altered limestone, near-surface portion of hydrothermal ore deposits. Easily alters to gypsum.",
        "Associated Minerals": "Calcite, dolomite, gypsum, halite",
        "": ""
      },
      {
        "Name": "apatite",
        "Mineral": "Apatite",
        "Formula": "Ca5(PO4)3(OH,F,Cl)",
        "Crystal System": "Hexagonal",
        "Hardness": 5,
        "Distinguishing Features": "Hexagonal prismatic crystal habit. Grayish, blue-green color, vitreous luster, conchoidal fracture. Often resembles beryl, but distinguished by hardness.",
        "Occurrence": "Common consituent of most rocks, but sparse. Skarn, marble, and calc-silicate gneiss. Occurs as detrital grains in clastic rocks. Often embedded in feldspar and quartz. Coarse-crystalline apatite occurs in granitic pegmatites and ore veins. Sometimes a petrifying material of wood.",
        "Associated Minerals": "Associated with most minerals, but found as large crystals associated with quartz, feldspar, tourmaline, muscovite, and beryl.",
        "": ""
      },
      {
        "Name": "augite",
        "Mineral": "Augite",
        "Formula": "Ca(Fe,Mg)Si2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Dark green to greenish-black color, hardness, and two planes of cleavage. Often forms slender crystals.",
        "Occurrence": "Contact metamorphosed rocks, schists. In igneous rocks, forms predominately from alkali-rich magmas. May also occur in carbonatites and blueschists.",
        "Associated Minerals": "K-feldspar, sodic amphiboles, quartz, feldspathoids. In limestone: amphibole, scapolite, vesuvianite, garnet, spinel, rutile, phlogopite, tourmaline",
        "": ""
      },
      {
        "Name": "azurite",
        "Mineral": "Azurite",
        "Formula": "Cu3(CO3)2(OH)",
        "Crystal System": "Monoclinic",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Azure blue color and blue streak. Effervesces in HCl. Vitreous luster, conchoidal fracture.",
        "Occurrence": "Secondary mineral in Cu-bearing hydrothermal deposits.",
        "Associated Minerals": "Malachite, chalcopyrite",
        "": ""
      },
      {
        "Name": "biotite",
        "Mineral": "Biotite",
        "Formula": "K(Fe,Mg)3AlSi3O10(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "2-3",
        "Distinguishing Features": "Perfect cleavage (one plane) and micaceous crystal habit. Vitreous luster. Usually black or brown, but can be nearly colorless. Alters to chlorite. Weathering may change appearance to golden yellow color with bronze luster.",
        "Occurrence": "Good crystals found in pegmatites. Common as disseminated grains in silicic, alkalic, and mafic igneous rocks. Metamorphic rocks such as hornfels, phyllites, schists,  and gneisses. Mg-rich biotite (phlogopite) found in some carbonates and marble. Often a component of immature sediments.",
        "Associated Minerals": "Feldspars, muscovite. Indicator of rare-earth minerals when found in pegmatites.",
        "": ""
      },
      {
        "Name": "calcite",
        "Mineral": "Calcite",
        "Formula": "CaCO3",
        "Crystal System": "Hexagonal",
        "Hardness": "2.5-3",
        "Distinguishing Features": "Hardness, rhombohedral cleavage, may exhibit llamelar twinning. Can be microcrystalline to coarse grained, and exhibits a huge variety of crystal habits. Effervesces in HCl. Aragonite also effervesces, but has no cleavage.",
        "Occurrence": "Widely distributed, all rock classes. In clastic sedimentary rocks as a cementing agent or fossils (also chemically precipitates). Limestone, marble, evaporite deposits, hydrothermal deposits. Sometimes found in silica-poor, alkali-rich igneous rocks.",
        "Associated Minerals": "Diopside, tremolite, olivine, garnet, wollastonite, calc-silicates",
        "": ""
      },
      {
        "Name": "chalcopyrite",
        "Mineral": "Chalcopyrite",
        "Formula": "CuFeS2",
        "Crystal System": "Tetragonal",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Metallic luster. Brassy, iridescent yellow, greenish-black streak, sphenoidal crystals, \"peacock-colored\" iridescent sheen.",
        "Occurrence": "Hydrothermal sulfide deposits and disseminated in igneous rocks. Also forms as a biomineral.",
        "Associated Minerals": "Galena, sphalerite, pyrite, pyrrhotite, other sulfide minerals",
        "": ""
      },
      {
        "Name": "chlorite",
        "Mineral": "Chlorite",
        "Formula": "(Mg,Fe,Al)6(Si,Al)4O10(OH)8",
        "Crystal System": "Monoclinic",
        "Hardness": "2-3",
        "Distinguishing Features": "Crystal habit, perfect cleavage (one plane), and green to yellow coloration. Folia are flexible but inelastic. Luster can be pearly, waxy, or dull.",
        "Occurrence": "Low- and medium-grade pelitic and mafic metamorphic rocks, chlorite schists. Common in igneous rocks (product of hornblende and biotite alteration). Also common in soil and sediments (component of clays). Mostly a product of primary iron, magnesium, and aluminum silicates.",
        "Associated Minerals": "Biotite, hornblende, garnet, olivine. May replace feldspars.",
        "": ""
      },
      {
        "Name": "clay",
        "Mineral": "Clays",
        "Formula": "Hydrous aluminosilicates, some containing Mg, Fe, K, Na, Ca, and other cations",
        "Crystal System": "NA",
        "Hardness": "1-3",
        "Distinguishing Features": "Earthy luster and hardness. Too fine grained to recognize grains in hand sample. Clays encompass a collection of sheet silicate minerals including kaolinite, smectite, illite, and chlorite.",
        "Occurrence": "Often form as a result of weathering or alteration. Most often found as aggregates of clay-sized grains in sedimentary rocks.",
        "Associated Minerals": "Huge variety of associated minerals.",
        "": ""
      },
      {
        "Name": "cordierite",
        "Mineral": "Cordierite",
        "Formula": "Mg2Al4Si5O18",
        "Crystal System": "Orthorhombic",
        "Hardness": 7,
        "Distinguishing Features": "Blue color distinguishes cordierite from quartz. Short, prismatic crystals. Vitreous luster. Softer than corundum. Less likely to form euhedral crystals than staurolite and andalusite.",
        "Occurrence": "Medium- to high-grade pelitic metamorphic rocks. Gneiss, schists and slates modified by extrusive rocks. Common porphyroblast in hornfels.",
        "Associated Minerals": "Quartz, orthoclase, albite, chlorite, andalusite, sillimanite, kyanite, staurolite, muscovite, biotite, chloritoid",
        "": ""
      },
      {
        "Name": "corundum",
        "Mineral": "Corundum",
        "Formula": "Al2O3",
        "Crystal System": "Hexagonal",
        "Hardness": 9,
        "Distinguishing Features": "Hardness is diagnostic. Adamantine luster. Crystal habit is hexagonal prisms capped with pinacoids. Uneven or conchoidal fracture.",
        "Occurrence": "Plutonic, pegmatitic, and regionally metamorphosed rocks. Al-rich, silica poor rocks, feldspathoidal pegmatites, xenoliths in mafic rocks, Si-poor hornfels. Accessory in nepheline syenites.",
        "Associated Minerals": "Aluminum silicates, micas, spinel, magnetite. Not found with quartz.",
        "": ""
      },
      {
        "Name": "diopside",
        "Mineral": "Diopside",
        "Formula": "CaMgSi2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Euhedral, stubby, tabular crystals. Vitreous luster. Conchoidal fracture. Light green in color. Cleavage at 87o and 93o.",
        "Occurrence": "Contact and regionally metamorphosed dolomitic limestones. Cr-rich diopside found in ultramafic rocks (e.g. kimberlite). Also skarns, marble, carbonates, and crystalline schists.",
        "Associated Minerals": "Tremolite-actinolite, grossular garnet, epidote, wollastonite, forsterite, calcite, dolomite. Alters to antigorite and sometimes hornblende.",
        "": ""
      },
      {
        "Name": "dolomite",
        "Mineral": "Dolomite",
        "Formula": "CaMg(CO3)2",
        "Crystal System": "Hexagonal",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Harder than calcite, usually forms smaller crystals. Can appear pearly or vitreous and have white to pinkish coloration. Only effervesces in HCl if powdered.",
        "Occurrence": "Primarily dolostone. Forms as pearly clusters in low-T hydrothermal vein deposits. Also carbonotites, marble, calc-silicate gneiss, and skarn.",
        "Associated Minerals": "Calcite, tremolite, diopside, garnet. In veins: galena, sphalerite",
        "": ""
      },
      {
        "Name": "epidote",
        "Mineral": "Epidote",
        "Formula": "Ca2(Al,Fe)3(SiO4)3(OH)",
        "Crystal System": "Monoclinic",
        "Hardness": "6-7",
        "Distinguishing Features": "Yellowish-green to pistachio-green color is distinct. Perfect, single cleavage distinguishes epidote from olivine. Common as anhedral grains or masses, but also often exhibits columnar crystal habit.",
        "Occurrence": "Accessory mineral in regional and contact metamorphic rocks (e.g. pelites, metacarbonates, meta-igneous rocks). Common in hydrothermal systems.",
        "Associated Minerals": "Quartz, feldspar, actinolite, chlorite",
        "": ""
      },
      {
        "Name": "fluorite",
        "Mineral": "Fluorite",
        "Formula": "CaF2",
        "Crystal System": "Isometric",
        "Hardness": 4,
        "Distinguishing Features": "Cubic crystal habit, perfect cleavage, hardness (can be scratched by a nail), vitreous luster",
        "Occurrence": "Hydrothermal mineral deposits, geodes. Minor constituent of granite, pegmatites, syenite. Sometimes a biological component in sedimentary rocks.",
        "Associated Minerals": "Sulfides (e.g. pyrite, galena, sphalerite), carbonates, barite",
        "": ""
      },
      {
        "Name": "galena",
        "Mineral": "Galena",
        "Formula": "PbS",
        "Crystal System": "Isometric",
        "Hardness": 2.5,
        "Distinguishing Features": "Cubic crystal habit, metallic luster, lead-gray color and streak, lightly marks paper, high specific gravity",
        "Occurrence": "Medium and low-T ore veins in hydrothermal sulfide deposits. Some calcite veins and organic-rich marine sediments.",
        "Associated Minerals": "Sphalerite, pyrite, chalcopyrite, quartz, calcite, fluorite, barite",
        "": ""
      },
      {
        "Name": "garnet",
        "Mineral": "Garnet",
        "Formula": "X3Y2(SiO4)3",
        "Crystal System": "Isometric",
        "Hardness": "6.5-7",
        "Distinguishing Features": "Hardness, color, vitreous luster. Often forms eu- or subhedral, dodecahedral porphyroblasts.",
        "Occurrence": "Pyrope: ultramafic igneous rocks, serpentinite; Almandine: mica schist, gneiss; Spessartine: felsic igneous rocks, mica schist, pegmatite, quartzite; Grossular and andradite: schists, metamorphosed carbonate-rich rocks",
        "Associated Minerals": "Huge variety of associated minerals",
        "": ""
      },
      {
        "Name": "glaucophane",
        "Mineral": "Glaucophane",
        "Formula": "Na2Mg3Al2Si8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Distinguished as an amphibole based on cleavage (56o and 124o). Prismatic, bladed crystal habit. Main diagnostic trait is blue color.",
        "Occurrence": "High P, low T regional metamorphic rocks (e.g. blueschist)",
        "Associated Minerals": "Lawsonite, pumpellyite, chlorite, albite, quartz, jadeite, epidote",
        "": ""
      },
      {
        "Name": "gypsum",
        "Mineral": "Gypsum",
        "Formula": "CaSO4*2H2O",
        "Crystal System": "Monoclinic",
        "Hardness": 2,
        "Distinguishing Features": "Hardness, three planes of cleavage, pearly luster on cleavage surfaces (can also be glassy or silky). Conchoidal, fibrous fracture",
        "Occurrence": "Marine evaporite deposits, alkaline lakes, efflorescense in desert soils. Altered (hydrated) form of anhydrite.",
        "Associated Minerals": "Halite, sylvite, calcite, dolomite, anhydrite",
        "": ""
      },
      {
        "Name": "halite",
        "Mineral": "Halite",
        "Formula": "NaCl",
        "Crystal System": "Isometric",
        "Hardness": 2.5,
        "Distinguishing Features": "Cubic cleavage, salty taste. May have a greasy luster.",
        "Occurrence": "Marine evaporite deposits, saline lake deposits and evaporated estuaries. Often interstratified with other sediments.",
        "Associated Minerals": "Calcite, dolomite, gypsum, anhydrite, sylvite, clays",
        "": ""
      },
      {
        "Name": "hematite",
        "Mineral": "Hematite",
        "Formula": "Fe2O3",
        "Crystal System": "Hexagonal",
        "Hardness": "5-6",
        "Distinguishing Features": "Red streak. Platy crystals with hexagonal outline (fine-grained masses of hematite may be oolitic or rounded). Crystalline hematite is metallic. Fine-grained hematite is dull or earthy.",
        "Occurrence": "Weathering or alteration of iron-bearing minerals. Large sedimentary deposits and secondary ore deposits after iron sulfides. Crystalline schists. Uncommonly found in igneous rocks (e.g. syenite, trachyte, granite, rhyolite). Product of fumaroles.",
        "Associated Minerals": "Quartz, carbonates, Fe-silicates. Alters to magnetite, siderite, limonite, pyrite.",
        "": ""
      },
      {
        "Name": "hornblende",
        "Mineral": "Hornblende",
        "Formula": "(Na,K)Ca2(Mg,Fe,Al)5(Si,Al)8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Cleavage (56o and 124o), elongate to bladed (often parallel) crystals, dark green-black in color. Glassy luster.",
        "Occurrence": "Most common in compositionally intermediate igneous rocks (especially diorite), but somewhat common in mafic and felsic rocks. Medium- to high-grade metamorphic mafic rocks (e.g. amphibolite, hornblende schist)",
        "Associated Minerals": "Quartz, biotite, plagioclase, orthoclase, pyroxenes. Alters to chlorite, epidote, calcite, siderite, quartz",
        "": ""
      },
      {
        "Name": "ilmenite",
        "Mineral": "Ilmenite",
        "Formula": "FeTiO3",
        "Crystal System": "Hexagonal",
        "Hardness": "5-6",
        "Distinguishing Features": "Metallic luster, black streak, weak magnetism. Crystals are tabular with hexagonal cross sections.",
        "Occurrence": "Accessory mineral in igneous and metamorphic rocks. Pegmatites. Commonly forms as exsolution llamelae in magnetite. Large masses in mafic and ultramafic rocks (gabbro, norite, anorthosite).",
        "Associated Minerals": "Clinopyroxene, orthopyroxene, olivine, plagioclase feldspar, magnetite",
        "": ""
      },
      {
        "Name": "kyanite",
        "Mineral": "Kyanite",
        "Formula": "Al2SiO5",
        "Crystal System": "Triclinic",
        "Hardness": "5-7",
        "Distinguishing Features": "Bladed or columnar crystal habit, perfect cleavage, blue-gray color, splintery. Vitreous to pearly luster.",
        "Occurrence": "High-P metamorphic rocks (schists, gneisses)",
        "Associated Minerals": "Garnet, micas, staurolite, corundum",
        "": ""
      },
      {
        "Name": "leucite",
        "Mineral": "Leucite",
        "Formula": "KAlSi2O6",
        "Crystal System": "Tetragonal",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Crystal habit (trapezohedral crystals) and occurrence.  Gray, white, or colorless. Vitreous luster. May be confused with analcime, but leucite often forms as phenocrysts instead of a cavity-filling mineral.",
        "Occurrence": "K-rich mafic lavas, shallow intrusive rock bodies. Weathers readily, therefore not found in many sediments.",
        "Associated Minerals": "Plagioclase, nepheline, sanidine, clinopyroxene, sodic-calcic amphiboles",
        "": ""
      },
      {
        "Name": "malachite",
        "Mineral": "Malachite",
        "Formula": "Cu2CO3(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Bright green, effervesces in HCl, concentric color banding, parallel fibrous grains. Often silky, but can be adamantine, vitreous or earthy",
        "Occurrence": "Cu-bearing hydrothermal deposits.",
        "Associated Minerals": "Azurite, chalcopyrite, cuprite, native copper",
        "": ""
      },
      {
        "Name": "magnetite",
        "Mineral": "Magnetite",
        "Formula": "Fe3O4",
        "Crystal System": "Isometric",
        "Hardness": "5.5-6.5",
        "Distinguishing Features": "Magnetic, metallic luster, no cleavage",
        "Occurrence": "Common component of igneous and metamorphic rocks, contact metamorphosed limestone and dolostone, and clastic sediments.",
        "Associated Minerals": "Diopside, tremolite, garnet, calcite, dolomite, calc-silicate minerals. Alters to hematite, limonite, siderite.",
        "": ""
      },
      {
        "Name": "microcline",
        "Mineral": "Microcline",
        "Formula": "(K, Na)AlSi3O8",
        "Crystal System": "Triclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Visible exsolution lamellae, good cleavage (near 90o), pink color (occasionally blue, green, white, or pale yellow). Commonly alters to sericite and clays.",
        "Occurrence": "Similar to orthoclase occurrence, but especially common in pegmatites and shear zones. Granite, granodiorite, syenite, granitic pegmatite, high-grade pelitic metamorphic rocks. Low T, not often found in volcanic rocks.",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "": ""
      },
      {
        "Name": "molybdenite",
        "Mineral": "Molybdenite",
        "Formula": "MoS2",
        "Crystal System": "Hexagonal",
        "Hardness": "1-1.5",
        "Distinguishing Features": "Metallic luster, lead-grey color with a blue tint, blue-grey streak. Greasy feel.",
        "Occurrence": "Hydrothermal vein deposits (e.g. porphyry molybdenum deposits, porphyry copper deposits), pegmatites, skarn deposits",
        "Associated Minerals": "Quartz, pyrite, sphalerite, sulfide minerals",
        "": ""
      },
      {
        "Name": "muscovite",
        "Mineral": "Muscovite",
        "Formula": "KAl3Si3O10(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "2-3",
        "Distinguishing Features": "Platey crystal habit, perfect cleavage. Lighter color than biotite. Colorless to light shades of green/red/brown. Book edges may appear dark.",
        "Occurrence": "Igneous and metamorphic rocks. Common  in felsic igneous rocks or as sericite alteration of alkali feldspar. Found in a wide variety of aluminous metamorphic rocks and metapelites, siliclastic sedimentary rocks, and arkosic sandstone.",
        "Associated Minerals": "Orthoclase, quartz, albite, apatite, tourmaline, garnet, beryl",
        "": ""
      },
      {
        "Name": "nepheline",
        "Mineral": "Nepheline",
        "Formula": "(Na,K)AlSiO4",
        "Crystal System": "Hexagonal",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Poor cleavage, greasy luster. Commonly occurs as anhedral masses, and less commonly as blocky hexagonal crystals with pinacoids. Resembles quartz, but softer. Tabular in igneous rocks and prismatic in geodes.",
        "Occurrence": "Alkali-rich, silicon-poor igneous rocks. Also contact metamorphosed rocks adjacent to alkali-rich intrusive rocks.",
        "Associated Minerals": "Kspar, Na-rich plagioclase, biotite, sodic/calcic amphibole or pyroxene, leucite, sodalite. Almost never occurs in large amounts with quartz.",
        "": ""
      },
      {
        "Name": "olivine",
        "Mineral": "Olivine",
        "Formula": "(Mg,Fe)2SiO4",
        "Crystal System": "Orthorhombic",
        "Hardness": "6.5-7",
        "Distinguishing Features": "Olive green color (usually less green than epidote). Conchoidal fracture, vitreous luster. Crystals often flattened, massive, compact, and irregular.",
        "Occurrence": "Mafic and ultramafic igneous rocks. Occasionally metamorphosed carbonate bearing rocks.",
        "Associated Minerals": "Ca-rich plagioclase, clinopyroxene, orthopyroxene, magnetite or calcite, dolomite, diopside, epidote, grossular, tremolite. Alters to iddingsite.",
        "": ""
      },
      {
        "Name": "omphacite",
        "Mineral": "Omphacite",
        "Formula": "(Ca, Na)(Al,Fe,Mg)Si2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Green or dark green color and context are indicative. Forms as stubby, prismatic crystals.",
        "Occurrence": "High P metamorphic rocks (eclogite)",
        "Associated Minerals": "Garnet, kyanite, quartz, lawsonite, amphiboles",
        "": ""
      },
      {
        "Name": "orthoclase",
        "Mineral": "Orthoclase",
        "Formula": "(K, Na)AlSi3O8",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (90o), Carlsbad twinning, often occurs as phenocrysts, commonly alters to sericite and clay. Often clear and glassy in comparison with microcline and sanidine. Colored, but often less strongly than microcline.",
        "Occurrence": "Igneous rocks, contact zones and other metamorphic rocks",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "": ""
      },
      {
        "Name": "orthopyroxene (hypersthene)",
        "Mineral": "Orthopyroxene (Hypersthene)",
        "Formula": "(Mg,Fe)2Si2O6",
        "Crystal System": "Orthorhombic",
        "Hardness": "5-6",
        "Distinguishing Features": "Euhedral crystals and stubby prisms. Right-angle cleavage.  Brown coloring. Difficult to distinguish from clinopyroxene.",
        "Occurrence": "Mafic and ultramafic igneous rocks and porphyries. Higher iron content orthopyroxene found in diorite, syenite, and granite. Also found in high-grade metamorphic rocks.",
        "Associated Minerals": "Feldspars, clinopyroxene, hornblende, biotite, garnet",
        "": ""
      },
      {
        "Name": "plagioclase feldspar",
        "Mineral": "Plagioclase Feldspar",
        "Formula": "NaAlSi3O8 - CaAl2Si2O8",
        "Crystal System": "Triclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (nearly 90o), parallel striations, most commonly a gray-white color",
        "Occurrence": "Abundant in igneous rocks. Detrital mineral in sedimentary rocks, but susceptible to weathering. Often occurs in metamorphic rocks as albite. Anorthite found in metamorphosed carbonates, amphibolites.",
        "Associated Minerals": "Clinopyroxene, orthopyroxene, olivine, quartz, muscovite, biotite",
        "": ""
      },
      {
        "Name": "pyrite",
        "Mineral": "Pyrite",
        "Formula": "FeS2",
        "Crystal System": "Isometric",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Cubic crystal habit, metallic luster, pale brassy yellow, greenish-black streak. Hardness and lighter yellow color distinguish it from chalcopyrite.",
        "Occurrence": "Hydrothermal sulfide deposits, igneous rocks of nearly any composition. Some metamorphic rocks. Fine grained pyrite in coal and shale.",
        "Associated Minerals": "Other sulfide minerals (galena, sphalerite, molybdenite), quartz, sericite",
        "": ""
      },
      {
        "Name": "pyrophillite",
        "Mineral": "Pyrophillite",
        "Formula": "Al2Si4O10(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "1-2",
        "Distinguishing Features": "Foliated, radiating, columnar, or aggregates of mica-like flakes or fibers, perfect cleavage, pearly to dull luster, hardness. Inelastic. Difficult to distinguish from talc.",
        "Occurrence": "Low-grade, Al-rich metamorphic rocks, schists.",
        "Associated Minerals": "Sometimes a result of hydrothermal alteration of aluminous minerals. Feldspars, muscovite, alminimum silicates, corundum, topaz.",
        "": ""
      },
      {
        "Name": "quartz",
        "Mineral": "Quartz",
        "Formula": "SiO2",
        "Crystal System": "Hexagonal",
        "Hardness": 7,
        "Distinguishing Features": "Hardness, conchoidal fracture, vitreous luster, distinct crystals. Beryl is often blue or green, and opal is softer.",
        "Occurrence": "Most igneous, metamorphic, and sedimentary rocks.",
        "Associated Minerals": "Huge variety. Uncommon in low silica environments.",
        "": ""
      },
      {
        "Name": "rutile",
        "Mineral": "Rutile",
        "Formula": "TiO2",
        "Crystal System": "Tetragonal",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Adamantine or metallic luster. Red-brown color. Crystals may form as striated prisms or finely fibrous crystals.",
        "Occurrence": "Usually fine-grained and difficult to idenitfy, but often occurs as an accessory mineral in metamorphic and igneous rocks (granite, gneiss, mica schist, syenitic rocks, amphibolites). Sometimes granular limestone and dolomite.",
        "Associated Minerals": "Quartz, calcite, topaz, sphalerite. Alters to ilmenite.",
        "": ""
      },
      {
        "Name": "sanidine",
        "Mineral": "Sanidine",
        "Formula": "(K, Na)AlSi3O8",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (90o), common as phenocrysts. Colorless to white, vitreous luster, carlsbad twinning. Alters to sericite and clay.",
        "Occurrence": "Silicic volcanic rocks (e.g. rhyolite, trachyte). High T.",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "": ""
      },
      {
        "Name": "serpentine",
        "Mineral": "Serpentine",
        "Formula": "Mg3Si2O5(OH)4",
        "Crystal System": "Monoclinic",
        "Hardness": "2.5-3.5",
        "Distinguishing Features": "Greasy or waxy luster (chrysotile is silky), usually shades of green (although susceptible to magnetite staining). Fibrous or fine-grained masses. Conchoidal or splintery fracture.",
        "Occurrence": "Hydrothermally altered mafic and ultramafic rocks. Serpentinite, peridotite, pyroxenite.",
        "Associated Minerals": "Magnetite, talc, calcite, brucite, chlorite, chromite, olivine, pyroxenes, amphiboles",
        "": ""
      },
      {
        "Name": "sillimanite",
        "Mineral": "Sillimanite",
        "Formula": "Al2SiO5",
        "Crystal System": "Orthorhombic",
        "Hardness": "6.5-7.5",
        "Distinguishing Features": "Fibrous crystal habit, may form swirled or matted aggregates. Satiny luster. Sometimes partially replaced by muscovite. Only one plane of cleavage.",
        "Occurrence": "Medium P, high T metamorphic rocks. Mica schists and gneisses.",
        "Associated Minerals": "Muscovite, corundum, often intergrown with andalusite",
        "": ""
      },
      {
        "Name": "spinel",
        "Mineral": "Spinel",
        "Formula": "MgAl2O4",
        "Crystal System": "Isometric",
        "Hardness": "7.5-8",
        "Distinguishing Features": "Octahedral or cubic crystal habit, hardness, often green or blue-green, but can be colorless. Conchoidal fracture.",
        "Occurrence": "Aluminous metamorphic rocks, contact or regionally metamorphosed limestone and dolostone, ultramafic rocks, occasionally granitic pegmatites and hydrothermal veins.",
        "Associated Minerals": "Andalusite, kyanite, sillimanite, cordierite, corundum, magnetite, calcite",
        "": ""
      },
      {
        "Name": "staurolite",
        "Mineral": "Staurolite",
        "Formula": "Fe2Al9O6((Si,Al)O4)4(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "7-7.5",
        "Distinguishing Features": "Cross-shaped twins, elongate, prismatic crystal habit with pinacoids, poor cleavage, brown color, vitreous luster",
        "Occurrence": "Medium-grade pelitic metamorphic rocks (schists).",
        "Associated Minerals": "Garnet, sillimanite, kyanite, tourmaline, cordierite, chloritoid, aluminum silicates, muscovite, biotite",
        "": ""
      },
      {
        "Name": "talc",
        "Mineral": "Talc",
        "Formula": "Mg3Si4O10(OH)2",
        "Crystal System": "Triclinic",
        "Hardness": 1,
        "Distinguishing Features": "Waxy feel, pearly or greasy luster, aggregates of irregular flakes and fibers, perfect, micaceous cleavage. Hardness, soapy feel. Often fine-grained and massive (\"soapstone\" form)",
        "Occurrence": "Hydrothermally altered mafic and ultramafic rocks. Metamorphism of dolomite.  Schists.",
        "Associated Minerals": "Serpentine, magnesite, olivine, tourmaline, pyroxene or calcite, dolomite, tremolite",
        "": ""
      },
      {
        "Name": "titanite",
        "Mineral": "Titanite",
        "Formula": "CaTiSiO5",
        "Crystal System": "Monoclinic",
        "Hardness": "5-5.5",
        "Distinguishing Features": "Wedge-shaped crystals, resinous luster, often a honey-brown color",
        "Occurrence": "Accessory mineral in many igneous rocks or mafic metamorphic rocks (hornblende granites, syenites, diorites, schists, gneisses). Also a heavy mineral in clastic sedimentary rocks.",
        "Associated Minerals": "Pyroxene, amphibole, chlorite, scapolite, zircon, apatite, quartz",
        "": ""
      },
      {
        "Name": "tourmaline",
        "Mineral": "Tourmaline",
        "Formula": "(Ca,Na,K)(Mg, Fe, Li, Al,Mn)3(Al,Cr,Fe,V)6Si6O18(BO3)3(O,OH)3(F,O,OH)",
        "Crystal System": "Hexagonal",
        "Hardness": 7,
        "Distinguishing Features": "Columnar, prismatic crystal habit, rounded triangular cross sections, often vertically striated. Vitreous to resinous luster. Conchoidal fracture.",
        "Occurrence": "Granitic pegmatites, felsic igneous rocks, rocks hydrothermally altered adjacent to pegmatitic or felsic intrusive rocks. Accessory in schist, gneiss, quartzite, phyllite, contact metamorphic zones. Resistant to weathering, therefore often found as clasts.",
        "Associated Minerals": "Muscovite, biotite, quartz, feldspars, beryl",
        "": ""
      },
      {
        "Name": "tremolite",
        "Mineral": "Tremolite",
        "Formula": "Ca2Mg5Si8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Cleavage, hardness, columnar or bladed crystal habit, white or dark grey to light green color. Often forms as compact masses of slender crystals.",
        "Occurrence": "Moderately high T and P conditions in the presence of water. Metamorphosed limestones or dolostones, gneisses and schist with serpentines, granites. Mafic and ultramafic igneous rocks, metagraywacke, blueschist.",
        "Associated Minerals": "Calcite, dolomite, forsterite, garnet, diopside, wollastonite, talc, epidote, chlorite",
        "": ""
      },
      {
        "Name": "wollastonite",
        "Mineral": "Wollastonite",
        "Formula": "CaSiO3",
        "Crystal System": "Triclinic",
        "Hardness": "4.5-5",
        "Distinguishing Features": "White, gray, or pale green. Splintery fracture. Good to perfect cleavage distinguishes it from tremolite.",
        "Occurrence": "Metamorphosed limestone and dolomite. Occasionally alkalic igneous rocks.",
        "Associated Minerals": "Calcite, dolomite, tremolite, epidote, grossular, diospide, garnet, Ca-Mg silicates.",
        "": ""
      },
      {
        "Name": "zircon",
        "Mineral": "Zircon",
        "Formula": "ZrSiO4",
        "Crystal System": "Tetragonal",
        "Hardness": "6.5-7.5",
        "Distinguishing Features": "Often microscopic prisms, elongate on the c-axis and capped by dipyramids. Adamantine luster, conchoidal fracture. Rarely seen in hand sample.  When enclosed by other minerals (e.g. micas, andalusite, amphiboles, pyroxenes), often bordered by pleochroic haloes.",
        "Occurrence": "Resistant to weathering and often endures the entirety of the rock cycle. Especially common in granite, nepheline syenite, diorite.",
        "Associated Minerals": "Huge variety of associated minerals.",
        "": ""
      }];

    return {
      'getMineralInfo': getMineralInfo
    };

    /**
     * Private Functions
     */

    /**
     * Public Functions
     */

    function getMineralInfo(name) {
      return _.find(mineralsInfoDescriptions, function (mineralDescription) {
        return mineralDescription.Name === name;
      });
    }
  }
}());
