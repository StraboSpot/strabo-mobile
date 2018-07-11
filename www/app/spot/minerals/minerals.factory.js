(function () {
  'use strict';

  angular
    .module('app')
    .factory('MineralsFactory', MineralsFactory);
 
  function MineralsFactory() {

    var mineralsInfoDescriptions =
      [
        {
          "Name": "actinilite",
          "Mineral": "Actinilite",
          "Formula": "Ca2Fe5Si8O22(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "5-6",
          "Distinguishing Features": "Good cleavage at 56o and 124o, columnar or bladed crystal habit. Color often a darker green than tremolite, but can be white or light green.",
          "Occurrence": "Contact or regionally metamorphosed limestone, dolostone. Mafic and ultramafic igneous rocks, metagraywacke, or blueschist. Ferro-actinolite is restricted to metamorphosed iron formations. ",
          "Associated Minerals": "Calcite, dolomite, forsterite, garnet, diopside, wollastonite, talc, epidote, chlorite"
        },
        {
          "Name": "andalusite",
          "Mineral": "Andalusite",
          "Formula": "Al2SiO5",
          "Crystal System": "Orthorhombic",
          "Hardness": "6.5-7.5",
          "Distinguishing Features": "Forms as prismatic, elongate porphyroblasts or as irregular masses. Often a pinkish color. Frequently riddled with quartz inclusions.",
          "Occurrence": "Low to medium temperature, low pressure metamorphic rocks (e.g. medium-grade mica schist)"
        },
        {
          "Name": "anhydrite",
          "Mineral": "Anhydrite",
          "Formula": "CaSO4",
          "Crystal System": "Orthorhombic",
          "Hardness": "3-3.5",
          "Distinguishing Features": "3 cleavage planes at 90o, colorless but often with a blue or purple hue",
          "Occurrence": "Marine evaporite deposits, hydrothermally altered limestone, near-surface portion of hydrothermal ore deposits",
          "Associated Minerals": "Calcite, dolomite, gypsum, halite"
        },
        {
          "Name": "apatite",
          "Mineral": "Apatite",
          "Formula": "Ca5(PO4)3(OH,F,Cl)",
          "Crystal System": "Hexagonal",
          "Hardness": "3.1-3.35",
          "Distinguishing Features": "Hardness, grayish, blue--green color, hexagonal prismatic crystal habit",
          "Occurrence": "Only found coarse-crystalline in granitic pegmatites, skarn, marble, and calc-silicate gneiss. Common detrital grain in clastic rocks."
        },
        {
          "Name": "augite",
          "Mineral": "Augite",
          "Formula": "Ca(Fe,Mg)Si2O6",
          "Crystal System": "Monoclinic",
          "Hardness": "6",
          "Distinguishing Features": "Dark green to greenish-black color, hardness, and cleavage. Often forms slender crystals.",
          "Occurrence": "Predominately alkali-rich magmas. May also occur in carbonatites and blueschists.",
          "Associated Minerals": "K-feldspar, sodic amphiboles, quartz, feldspathoids"
        },
        {
          "Name": "azurite",
          "Mineral": "Azurite",
          "Formula": "Cu3(CO3)2(OH)",
          "Crystal System": "Monoclinic",
          "Hardness": "3.5-4",
          "Distinguishing Features": "Azure blue color and blue streak. Effervesces in HCl.",
          "Occurrence": "Cu-bearing hydrothermal deposits ",
          "Associated Minerals": "Malachite, chalcopyrite"
        },
        {
          "Name": "biotite",
          "Mineral": "Biotite",
          "Formula": "K(Fe,Mg)3AlSi3O10(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "43134",
          "Distinguishing Features": "Perfect cleavage (one plane) and micaceous crystal habit. Usually black or brown, but can be nearly colorless. Alters to chlorite. ",
          "Occurrence": "Silicic and alkalic igneous rocks or  mafic rocks (late-stage mineralization). Also in metamorphic rocks such as hornfels, phyllites, schists,  and gneisses. Mg-rich biotite found in some carbonates and marble. Often a component of immature sediments. "
        },
        {
          "Name": "calcite",
          "Mineral": "Calcite",
          "Formula": "CaCO3",
          "Crystal System": "Hexagonal",
          "Hardness": "2.5-3",
          "Distinguishing Features": "Hardness, may exhibit llamelar twinning. Effervesces in HCl.",
          "Occurrence": "In clastic sedimentary rocks as a cementing agent or fossils (also chemically precipitates). Limestone, marble, evaporite deposits, hydrothermal deposits. Rarely found in silica-poor, alkai-rich igneous rocks.",
          "Associated Minerals": "Diopside, tremolite, olivine, garnet, wollastonite, calc-silicates"
        },
        {
          "Name": "chalcopyrite",
          "Mineral": "Chalcopyrite",
          "Formula": "CuFeS2",
          "Crystal System": "Tetragonal",
          "Hardness": "3.5-4",
          "Distinguishing Features": "Metallic luster. Brassy, iridescent yellow, greenish-black streak, \"Peacock-colored\" sheen.",
          "Occurrence": "Hydrothermal sulfide deposits and some mafic igneous rocks. Also forms as a biomineral.",
          "Associated Minerals": "Galena, sphalerite, pyrite, other sulfide minerals"
        },
        {
          "Name": "chlorite",
          "Mineral": "Chlorite",
          "Formula": "(Mg,Fe,Al)3(Si,Al)4O10",
          "Crystal System": "Monoclinic",
          "Hardness": "43134",
          "Distinguishing Features": "Crystal habit, perfect cleavage (one plane), and green to yellow coloration. Folia are flexible but inelastic. Luster can be pearly, waxy, or dull.",
          "Occurrence": "Low- and medium-grade pelitic and mafic metamorphic rocks. Common in igneous rocks (product of hornblende and biotite alteration). Common in soil and sediments.",
          "Associated Minerals": "Biotite, hornblende"
        },
        {
          "Name": "cordierite",
          "Mineral": "Cordierite",
          "Formula": "Mg2Al4Si5O18",
          "Crystal System": "Orthorhombic",
          "Hardness": "7",
          "Distinguishing Features": "Blue color distinguishes cordierite from quartz. Softer than corundum. Less likely to form euhedral crystals than staurolite and andalusite.",
          "Occurrence": "Medium- to high-grade pelitic metamorphic rocks. Common porphyroblast in hornfels.",
          "Associated Minerals": "Chlorite, andalusite, sillimanite, kyanite, staurolite, muscovite, biotite, chloritoid"
        },
        {
          "Name": "corundum",
          "Mineral": "Corundum",
          "Formula": "Al2O3",
          "Crystal System": "Hexagonal",
          "Hardness": "9",
          "Distinguishing Features": "Hardness is diagnostic. Crystal habit is hexagonal prisms capped with pinacoids. Uneven or conchoidal fracture.",
          "Occurrence": "Al-rich, silica poor igneous and metamorphic rocks, feldspathoidal pegmatites, xenoliths in mafic rocks, Si-poor hornfels.",
          "Associated Minerals": "Aluminum silicates, micas, spinel. Not found with quartz."
        },
        {
          "Name": "diopside",
          "Mineral": "Diopside",
          "Formula": "CaMgSi2O6",
          "Crystal System": "Monoclinic",
          "Hardness": "5.5-6",
          "Distinguishing Features": "Euhedral, stubby, tabular crystals. Light green in color. 90o cleavage.",
          "Occurrence": "Cr-rich diopside found in ultramafic rocks (e.g. kimberlite). Also skarns, marble and carbonates.",
          "Associated Minerals": "Tremolite-actinolite, grossular garnet, epidote, wollastonite, forsterite, calcite, dolomite"
        },
        {
          "Name": "dolomite",
          "Mineral": "Dolomite",
          "Formula": "CaMg(CO3)2",
          "Crystal System": "Hexagonal",
          "Hardness": "3.5-4",
          "Distinguishing Features": "Harder than calcite. Only effervesces in HCl if powdered.",
          "Occurrence": "Dolostone, hydrothermal vein deposits, carbonotites, marble, calc-silicate gneiss, skarn",
          "Associated Minerals": "Calcite, tremolite, diopside, garnet"
        },
        {
          "Name": "epidote",
          "Mineral": "Epidote-Clinozoisite",
          "Formula": "Ca2Al2(Al,Fe3+)OOH",
          "Crystal System": "Monoclinic",
          "Hardness": "43258",
          "Distinguishing Features": "Yellowish-green to pistachio-green color is distinct. Perfect, single cleavage distinguishes epidote from olivine. Common as anhedral grains/masses, but exhibits columnar crystal habit.",
          "Occurrence": "Accessory mineral in regional and contact metamorphic rocks (e.g. pelites, metacarbonates, meta-igneous rocks). Epidote in more iron rich rocks. Common in hydrothermal systems."
        },
        {
          "Name": "fluorite",
          "Mineral": "Fluorite",
          "Formula": "CaF2",
          "Crystal System": "Isometric",
          "Hardness": "4",
          "Distinguishing Features": "Cubic crystal habit, perfect cleavage, hardness (can be scratched by a nail)",
          "Occurrence": "Hydrothermal mineral deposits, geodes. Sometimes a biological component in sedimentary rocks. Minor constituent of granite, pegmatites, syenite.",
          "Associated Minerals": "Sulfides (e.g. pyrite, galena, sphalerite), carbonates, barite"
        },
        {
          "Name": "galena",
          "Mineral": "Galena",
          "Formula": "PbS",
          "Crystal System": "Isometric",
          "Hardness": "2.5",
          "Distinguishing Features": "Cubic crystal habit, metallic luster, lead-gray color and streak, lightly marks paper, high specific gravity",
          "Occurrence": "Hydrothermal sulfide deposits or organic-rich marine sediments ",
          "Associated Minerals": "Sphalerite, pyrite, chalchopyrite, quartz, calcite, fluorite, barite"
        },
        {
          "Name": "garnet",
          "Mineral": "Garnet",
          "Formula": "X3Y2(SiO4)3",
          "Crystal System": "Isometric",
          "Hardness": "6.5-7",
          "Distinguishing Features": "Hardness, color. Often forms eu- or subhedral, dodecahedral porphyroblasts.",
          "Occurrence": "Pyrope: ultramafic igneous rocks/serpentinite; Almandine: mica schist, gneiss; Spessartine: felsic igneous rocks; Grossular, andradite: metamorphosed carbonate-rich rocks",
          "Associated Minerals": "Huge variety"
        },
        {
          "Name": "glaucophane",
          "Mineral": "Glaucophane",
          "Formula": "Na2Mg3Al2Si8O22(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "5-6",
          "Distinguishing Features": "Distinguished as an amphibole based on cleavage (56o and 124o). Prismatic, bladed crystal habit. Main characteristic is blue color.",
          "Occurrence": "High pressure, low temperature regional metamorphic rocks (blueschist)",
          "Associated Minerals": "Lawsonite, pumpeyllite, chlorite, albite, quartz, jadeite, epidote"
        },
        {
          "Name": "gypsum",
          "Mineral": "Gypsum",
          "Formula": "CaSO4*2H2O",
          "Crystal System": "Monoclinic",
          "Hardness": "2",
          "Distinguishing Features": "Hardness, four planes of cleavage, pearly luster on cleavage surfaces",
          "Occurrence": "Marine evaporite deposits, alkaline lakes, efflorescense in desert soils",
          "Associated Minerals": "Halite, sylvite, calcite, dolomite, anhydrite"
        },
        {
          "Name": "halite",
          "Mineral": "Halite",
          "Formula": "NaCl",
          "Crystal System": "Isometric",
          "Hardness": "2.5",
          "Distinguishing Features": "Cubic cleavage, salty taste. May have a greasy luster. ",
          "Occurrence": "Marine evaporite deposits, saline lake deposits",
          "Associated Minerals": "Calcite, dolomite, gypsum, anhydrite, sylvite, clays"
        },
        {
          "Name": "hematite",
          "Mineral": "Hematite",
          "Formula": "Fe2O3",
          "Crystal System": "Hexagonal",
          "Hardness": "5-6",
          "Distinguishing Features": "Red streak. Platy crystals with hexagonal outline (fine-grained masses of hematite may be oolitic or rounded). Crystalline hematite is metallic, fine-grained hematite is dull or earthy. ",
          "Occurrence": "Weathering or alteration of iron-bearing minerals. Iron formations. Uncommonly found in igneous rocks (e.g. syenite, trachyte, granite, rhyolite)",
          "Associated Minerals": "Magnetite, quartz, carbonates, Fe-silicates"
        },
        {
          "Name": "hornblende",
          "Mineral": "Hornblende",
          "Formula": "(Na,K)Ca2(Mg,Fe,Al)5(Si,Al)8O22(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "43226",
          "Distinguishing Features": "Cleavage (56o and 124o), elongate to bladed (often parallel) crystals, dark green-black in color",
          "Occurrence": "Most common in compositionally intermediate igneous rocks, but somewhat common in mafic and felsic rocks. Medium- to high-grade metamorphic mafic rocks (e.g. amphibolite)"
        },
        {
          "Name": "ilmenite",
          "Mineral": "Ilmenite",
          "Formula": "FeTiO3",
          "Crystal System": "Hexagonal ",
          "Hardness": "43226",
          "Distinguishing Features": "Metallic luster, black streak, weak magnetism. Crystals are tabular with hexagonal cross sections.",
          "Occurrence": "Accessory mineral in igneous and metamorphic rocks. Commonly exsolution llamelae in magnetite. Large masses in mafic and ultramafic rocks."
        },
        {
          "Name": "kyanite",
          "Mineral": "Kyanite",
          "Formula": "Al2SiO5",
          "Crystal System": "Triclinic",
          "Hardness": "43227",
          "Distinguishing Features": "Bladed or columnar crystal habit, perfect cleavage, blue-gray color, splintery",
          "Occurrence": "High-pressure metamorphic rocks"
        },
        {
          "Name": "leucite",
          "Mineral": "Leucite",
          "Formula": "KAlSi2O6",
          "Crystal System": "Tetragonal",
          "Hardness": "5.5-6",
          "Distinguishing Features": "Crystal habit (trapezohedral crystals) and occurrence. May be confused with analcime, but leucite often forms as phenocrysts instead of a cavity-filling mineral.",
          "Occurrence": "K-rich mafic lavas, shallow intrusive rock bodies. Weathers readily, not found in many sediments. ",
          "Associated Minerals": "Plagioclase, nepheline, sanidine, clinopyroxene, sodic-calcic amphiboles"
        },
        {
          "Name": "malachite",
          "Mineral": "Malachite",
          "Formula": "Cu2CO3(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "3.5-4",
          "Distinguishing Features": "Bright green, effervesces in HCl, concentric color banding, parallel fibrous grains. Adamantine, silky, vitreous or earthy luster",
          "Occurrence": "Cu-bearing hydrothermal deposits ",
          "Associated Minerals": "Azurite, chalcopyrite"
        },
        {
          "Name": "magnetite",
          "Mineral": "Magnetite",
          "Formula": "Fe3O4",
          "Crystal System": "Isometric",
          "Hardness": "5.5-6.5",
          "Distinguishing Features": "Magnetic, no cleavage",
          "Occurrence": "Common component of igneous and metamorphic rocks, contact metamorphosed limestone and dolostone, clastic sediments.",
          "Associated Minerals": "Diopside, tremolite, garnet, calcite, dolomite, calc-silicate minerals"
        },
        {
          "Name": "microcline",
          "Mineral": "Microcline",
          "Formula": "(K, Na)AlSi3O8",
          "Crystal System": "Triclinic",
          "Hardness": "6-6.5",
          "Distinguishing Features": "Visible exsolution lamellae, good cleavage (near 90o), pink color (occasionally blue, green, white, or pale yellow). Commonly alters to sericite and clay.",
          "Occurrence": "Granite, granodiorite, syenite, granitic pegmatite, high-grade pelitic metamorphic rocks. Low temperature, not often found in volcanic rocks. "
        },
        {
          "Name": "molybdenite",
          "Mineral": "Molybdenite",
          "Formula": "MoS2",
          "Crystal System": "Hexagonal",
          "Hardness": "1-1.5",
          "Distinguishing Features": "Metallic luster, lead-grey color with a blue tint, blue-grey streak",
          "Occurrence": "Hydrothermal vein deposits (e.g. porphyry molybdenum deposits, porphyry copper deposits), pegmatites, skarn deposits",
          "Associated Minerals": "Quartz, pyrite, sphalerite, other sulfide minerals"
        },
        {
          "Name": "muscovite_whi",
          "Mineral": "Muscovite",
          "Formula": "KAl3Si3O10(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "2.5-4",
          "Distinguishing Features": "Crystal habit and perfect cleavage. Lighter than biotite. Colorless to light shades of green/red/brown. Book edges may appear dark. ",
          "Occurrence": "Commonly occurs in felsic igneous rocks or as sericite alteration of alkali feldspar or other minerals. Found in a wide variety of aluminous metamorphic rocks and metapelites. Siliclastic sedimentary rocks and arkosic sandstone. Commonly confused with paragonite.  "
        },
        {
          "Name": "nepheline",
          "Mineral": "Nepheline",
          "Formula": "(Na,K)AlSiO4",
          "Crystal System": "Hexagonal",
          "Hardness": "5.5-6",
          "Distinguishing Features": "Poor cleavage, greasy luster, subconchoidal fracture. Commonly occurs as anhedral masses, less commonly blocky hexagonal crystals with pinacoid. Resembles quartz, but softer. ",
          "Occurrence": "Alkali-rich, silicon poor igneous rocks. Contact metamorphosed rocks.",
          "Associated Minerals": "Kspar, Na-rich plagioclase, biotite, sodic/calcic amphibole or pyroxene. Almost never occurs in large amounts with quartz. "
        },
        {
          "Name": "olivine",
          "Mineral": "Olivine",
          "Formula": "(Mg,Fe)2SiO4",
          "Crystal System": "Orthorhombic",
          "Hardness": "6.5-7",
          "Distinguishing Features": "Green (usually less green than epidote), vitreous luster, conchoidal fracture ",
          "Occurrence": "Mafic and ultramafic igneous rocks. Occasionally metamorphosed carbonate bearing rocks.",
          "Associated Minerals": "Ca-rich plagioclase, clinopyroxene, orthopyroxene or calcite, dolomite, diopside, epidote, grossular, tremolite"
        },
        {
          "Name": "orthoclase",
          "Mineral": "Orthoclase",
          "Formula": "(K, Na)AlSi3O8",
          "Crystal System": "Monoclinic",
          "Hardness": "6-6.5",
          "Distinguishing Features": "Good cleavage (90o), carlsbad twinning, often occurs as phenocrysts, commonly alters to sericite and clay. Often clear and glassy in comparison with microcline and sanidine. Colored, but often less strongly than microcline."
        },
        {
          "Name": "orthopyroxene",
          "Mineral": "Orthopyroxene",
          "Formula": "(Mg,Fe)2Si2O6",
          "Crystal System": "Orthorhombic",
          "Hardness": "5-6",
          "Distinguishing Features": "Euhedral crystals and stubby prisms.Right-angle cleavage.  Brown coloring. High Fe varieties difficult to distinguish from clinopyroxene.",
          "Occurrence": "Mafic and ultramafic igneous rocks. Higher iron content opx can be found in diorite, syenite, and granite. Also found in high-grade metamorphic rocks.",
          "Associated Minerals": "Feldspars, clinopyroxene, hornblende, biotite, garnet"
        },
        {
          "Name": "plagioclase",
          "Mineral": "Plagioclase Feldspar",
          "Formula": "NaAlSi3O8 - CaAl2Si2O8",
          "Crystal System": "Triclinic",
          "Hardness": "6-6.5",
          "Distinguishing Features": "Good cleavage (nearly 90o), parallel striations, most commonly a gray-white",
          "Occurrence": "Abundant in igneous rocks. Detrital mineral in sedimentary rocks, but susceptible to weathering. Often occurs in metamorphic rocks as albite. Anorthite found in metamorphosed carbonates, amphibolites."
        },
        {
          "Name": "pyrite",
          "Mineral": "Pyrite",
          "Formula": "FeS2",
          "Crystal System": "Isometric",
          "Hardness": "6-6.5",
          "Distinguishing Features": "Cubic crystal habit, metallic luster, pale brassy yellow, greenish-black streak. Hardness and lighter yellow color distinguish it from chalcopyrite.",
          "Occurrence": "Hydrothermal sulfide deposits, igneous rocks of nearly any composition. Some metamorphic rocks. Fine grained pyrite in coal and shale.",
          "Associated Minerals": "Sulfide minerals and common minerals in igneous rocks."
        },
        {
          "Name": "pyrophillite",
          "Mineral": "Pyrophillite",
          "Formula": "Al2Si4O10(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "1-2",
          "Distinguishing Features": "Foliated, radiating, columnar, aggregates of mica-like flakes or fibers, perfect cleavage, pearly to dull luster, hardness, inelastic. Difficult to distinguish from talc.",
          "Occurrence": "Uncommon. Low-grade, Al-rich metamorphic rocks ",
          "Associated Minerals": "Sometimes a result of hydrothermal alteration of aluminous minerals Feldspars, muscovite, alminimum silicates, corundum, topaz."
        },
        {
          "Name": "quartz",
          "Mineral": "Quartz",
          "Formula": "SiO2",
          "Crystal System": "Hexagonal, trigonal",
          "Hardness": "7",
          "Distinguishing Features": "Hardness, conchoidal fracture, vitreous luster, crystal habit. Beryl is often blue or green. Opal is softer.",
          "Occurrence": "Most igneous, metamorphic, and sedimentary rocks."
        },
        {
          "Name": "rutile",
          "Mineral": "Rutile",
          "Formula": "TiO2",
          "Crystal System": "Tetrahedral",
          "Hardness": "6-6.5",
          "Distinguishing Features": "Adamantine or metallic luster, red-brown color, conchoidal to uneven fracture",
          "Occurrence": "Usually fine-grained and difficult to idenitfy, but often an accessory mineral in metamorphic and igneous rocks."
        },
        {
          "Name": "sanidine",
          "Mineral": "Sanidine",
          "Formula": "(K, Na)AlSi3O8",
          "Crystal System": "Monoclinic",
          "Hardness": "6-6.5",
          "Distinguishing Features": "Good cleavage (90o), common as phenocrysts, colorless to white, alters to sericite and clay",
          "Occurrence": "Silicic volcanic rocks (e.g. rhyolite, trachyte). High temperature. "
        },
        {
          "Name": "serpentine",
          "Mineral": "Serpentine",
          "Formula": "Mg3Si2O5(OH)4",
          "Crystal System": "Monoclinic",
          "Hardness": "2.5-3.5",
          "Distinguishing Features": "Greasy or waxy luster (chrysotile is silky), often shades of green (although susceptible to magnetite staining), fibrous or fine-grained masses.",
          "Occurrence": "Hydrothermally altered mafic and ultramafic rocks. Serpentinite, peridotite, pyroxenite. ",
          "Associated Minerals": "Magnetite, talc, calcite, brucite, chlorite, chromite, olivine, pyroxenes"
        },
        {
          "Name": "sillimanite",
          "Mineral": "Sillimanite",
          "Formula": "Al2SiO5",
          "Crystal System": "Orthorhombic",
          "Hardness": "6.5-7.5",
          "Distinguishing Features": "Fibrous crystal habit, may form swirled or matted aggregates. Sometimes partially replaced by muscovite. Only one plane of cleavage.",
          "Occurrence": "Medium pressure, high temperature. High grade pelitic meatmorphic rocks."
        },
        {
          "Name": "spinel",
          "Mineral": "Spinel",
          "Formula": "MgAl2O4",
          "Crystal System": "Isometric",
          "Hardness": "7.5-8",
          "Distinguishing Features": "Octahedral or cubic crystal habit, hardness, often green or blue-green, but can be colorless. Conchoidal fracture.",
          "Occurrence": "Aluminous metamorphic rocks, contact or regionally metamorphosed limestone and dolostone, occasionally granitic pegmatitesand hydrothermal veins",
          "Associated Minerals": "Andalusite, kyanite, sillimanite, cordierite, corundum"
        },
        {
          "Name": "staurolite",
          "Mineral": "Staurolite",
          "Formula": "Fe2Al9O6((Si,Al)O4)4(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "7-7.5",
          "Distinguishing Features": "Cross-shaped twins, elongate, prismatic crystal habit with pinacoids, poor cleavage, brown color",
          "Occurrence": "Medium-grade pelitic metamorphic rocks",
          "Associated Minerals": "Garnet, cordierite, chloritoid, aluminum silicates, muscovite, biotite"
        },
        {
          "Name": "talc",
          "Mineral": "Talc",
          "Formula": "Mg3Si4O10(OH)2",
          "Crystal System": "Triclinic, monoclinic",
          "Hardness": "1",
          "Distinguishing Features": "Waxy feel, pearly or greasy luster, aggregates of irregular flakes and fibers, perfect cleavage",
          "Occurrence": "Hydrothermally altered mafic and ultramafic rocks. Metamorphism of dolomite. ",
          "Associated Minerals": "Serpentine, magnesite, olivine, pyroxene or calcite, dolomite, tremolite"
        },
        {
          "Name": "titanite",
          "Mineral": "Titanite",
          "Formula": "CaTiSiO5",
          "Crystal System": "Monoclinic",
          "Hardness": "5-5.5",
          "Distinguishing Features": "Wedge-shaped crystals, resinous luster, often a honey-brown color",
          "Occurrence": "Accessory mineral in many igneous rocks or mafic metamorphic rocks. Also a heavy mineral in clastic sedimentary rocks."
        },
        {
          "Name": "tourmaline",
          "Mineral": "Tourmaline",
          "Formula": "Na(Mg, Fe, Li, Al)3Al6Si6O18(BO3)3(O,OH,F)4",
          "Crystal System": "Hexagonal",
          "Hardness": "7",
          "Distinguishing Features": "Columnar, prismatic crystal habit, rounded triangular cross sections, often vertically striated. Conchoidal fracture. ",
          "Occurrence": "Granitic pegmatites, felsic igneous rocks, or rocks hydrothermally altered adjacent to pegmatite or felsic intrusive rocks. Accessory in schist, gneiss, quartzite, phyllite, contact metamorphic zones. Resistant to weathering, therefore often found as clasts."
        },
        {
          "Name": "tremolite",
          "Mineral": "Tremolite",
          "Formula": "Ca2Mg5Si8O22(OH)2",
          "Crystal System": "Monoclinic",
          "Hardness": "5-6",
          "Distinguishing Features": "Cleavage, hsrdness, columnar or bladed crystal habit, white to light green color",
          "Occurrence": "Contact and regionally metamorphosed limestone, dolomite. Mafic and ultramafic igneous rocks, metagraywacke, blueschist. ",
          "Associated Minerals": "Calcite, dolomite, forsterite, garnet, diopside, wollastonite, talc, epidote, chlorite"
        },
        {
          "Name": "wollastonite",
          "Mineral": "Wollastonite",
          "Formula": "CaSiO3",
          "Crystal System": "Triclinic",
          "Hardness": "4.5-5",
          "Distinguishing Features": "White, gray, or pale green. Good-perfect cleavage distinguishes it from tremolite. ",
          "Occurrence": "Metamorphosed limestone and dolomite. Occasionally alkalic igneous rocks.",
          "Associated Minerals": "Calcite, dolomite, tremolite, epidote, grossular, diospide, Ca-Mg silicates."
        },
        {
          "Name": "zircon",
          "Mineral": "Zircon",
          "Formula": "ZrSiO4",
          "Crystal System": "Tetragonal",
          "Hardness": "7.5",
          "Distinguishing Features": "Often microscopic prisms, elongate on the c-axis and capped by dipyramids. Rarely seen in hand sample.  ",
          "Occurrence": "Resistant to weathering and can often endure the entirety of the rock cycle.",
          "Associated Minerals": "Huge variety."
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
