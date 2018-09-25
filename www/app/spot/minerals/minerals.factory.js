(function () {
  'use strict';

  angular
    .module('app')
    .factory('MineralsFactory', MineralsFactory);

  function MineralsFactory() {
    var mineralsInfoDescriptions =
      [
        {// Ign Only
          'Name': 'acmite',
          'Mineral': 'Acmite (Aegirine)',
          'Formula': 'NaFeSi2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '6',
          'Distinguishing Features': "Sharply pointed terminations or blocky prismatic crystals, uneven fracture, vitreous luster. Dark green, greenish black, reddish brown. Differentiated from hornblende by acmite's less perfect cleavage. Crystals vertically striated. Polysynthetic twinning common. Pale yellowish-grey streak.",
          'Occurrence': 'Alkali-rich magmas (alkali granite, syenite, nepheline syenite, phonolite), low silica rocks (carbonatites)',
          'Associated Minerals': 'K-spar, sodic amphiboles, feldspathoids, quartz, nepheline, leucite',
          'mindat.org link': 'https://www.mindat.org/min-31.html'
        },
        {// Meta
          'Name': 'actinolite',
          'Mineral': 'Actinolite',
          'Formula': 'Ca2(Mg,Fe)5Si8O22(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Good cleavage at 56o and 124o. Elongate, prismatic crystal habit, sometimes fibrous. Often compact masses of slender crystals. Gray green to bright green color due to even minor presence of Fe. White color indicates the mineral is most likely tremolite. ',
          'Occurrence': 'Moderately high temperature and pressure conditions in the presence of water, contact metamorphosed rocks, marbles, gneisses and schist with serpentine, granites.  Sometimes found as hair-like inclusions in quartz crystals. Common in mafic and ultramafic igneous rocks, metagraywacke, or blueschist.',
          'Associated Minerals': 'Dolomite, forsterite, garnet, diopside, wollastonite. Alters to talc, chlorite, epidote, and calcite.',
          'mindat.org link': 'https://www.mindat.org/min-18.html'
        },
        {// Meta & Ign
          'Name': 'albite',
          'Mineral': 'Albite',
          'Formula': 'NaAlSi3O8 ',
          'Crystal System': 'Triclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Good cleavage (nearly 90o), parallel striations, most commonly a gray-white color. Pearly luster.',
          'Occurrence': 'Common in pegmatites, veins, and schists. Found in some limestones. Pervasive along feldspar contacts in granites and granodiorites.',
          'Associated Minerals': 'Quartz, muscovite, biotite',
          'mindat.org link': 'https://www.mindat.org/min-96.html'
        },
        {// Meta & Ign
          'Name': 'allanite',
          'Mineral': 'Allanite',
          'Formula': '(Ca,Mn,Ce,La,Y,Th)2Al(Al,Fe)(Fe,Ti)OOH(Si2O7)(SiO4)',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6.5',
          'Distinguishing Features': 'Light brown to black color. Columnar, bladed, or elongate grains, and sometimes forms as massive aggregates. Pleochroic haloes may form around allanite enclosed in other minerals, and the crystal structure may become metamict as radioactive elements decay. Subconchoidal fracture. Vitreous, resinous, or submetallic luster.',
          'Occurrence': 'Accessory in felsic igneous rocks (granite, syenite, granodiorite, monzonite, etc.) and some felsic volcanic rocks. Occurs in large masses in granitic pegmatite. Skarn deposits, metamorphosed carbonate rocks, amphibolite, granitic gneiss, magnetite-iron ores',
          'Associated Minerals': 'Mafic silicates, epidote. Often embedded in feldspar, hornblende, or biotite.',
          'mindat.org link': 'https://www.mindat.org/min-46220.html'
        },
        {// Meta & Ign
          'Name': 'amphibole',
          'Mineral': 'Amphibole',
          'Formula': 'AX2Z5Si8O22(OH.F,Cl,O)2',
          'Crystal System': 'Monoclinic, orthorhombic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Cleavage at 56o and 124o, usually dark green to black coloration, elongate prismatic crystal habit, characteristic hardness',
          'Occurrence': 'More Si-rich rocks than pyroxene or olivine, intermediate to felsic rocks, medium to high grade metamorphic rocks',
          'Associated Minerals': 'Quartz, K-feldspar, biotite, muscovite, plagioclase, orthoclase, pyroxenes',
          'mindat.org link': 'https://www.mindat.org/min-207.html'
        },
        {// Meta
          'Name': 'andalusite',
          'Mineral': 'Andalusite',
          'Formula': 'Al2SiO5',
          'Crystal System': 'Orthorhombic',
          'Hardness': '6.5-7.5',
          'Distinguishing Features': 'Forms as square to elongate prismatic porphyroblasts or as irregular masses. Uncolored streak. Frequently riddled with quartz inclusions.',
          'Occurrence': 'Low to medium temperature, low pressure metamorphic rocks (e.g. medium-grade mica schist). Contacts between igneous rocks and shales. ',
          'Associated Minerals': 'Garnet, muscovite, biotite, hornblende, quartz. Readily alters to sericite.',
          'mindat.org link': 'https://www.mindat.org/min-217.html'
        },
        {// Ign Only
          'Name': 'anhydrite',
          'Mineral': 'Anhydrite',
          'Formula': 'CaSO4',
          'Crystal System': 'Orthorhombic',
          'Hardness': '3-3.5',
          'Distinguishing Features': 'Cubic cleavage, vitreous to pearly luster, uneven to splintery fracture. Colorless, but often exhibits a blue, reddish, or purple hue.',
          'Occurrence': 'Marine evaporite deposits, hydrothermally altered limestone, near-surface portion of hydrothermal ore deposits. Easily alters to gypsum.',
          'Associated Minerals': 'Calcite, dolomite, gypsum, halite',
          'mindat.org link': 'https://www.mindat.org/min-234.html'
        },
        {// Meta & Ign
          'Name': 'apatite',
          'Mineral': 'Apatite',
          'Formula': 'Ca5(PO4)3(OH,F,Cl)',
          'Crystal System': 'Hexagonal',
          'Hardness': '5',
          'Distinguishing Features': 'Hexagonal prismatic crystal habit. Grayish, blue-green color, vitreous luster, conchoidal fracture. Often resembles beryl, but distinguished by hardness. ',
          'Occurrence': 'Common consituent of most rocks, but sparse. Skarn, marble, and calc-silicate gneiss. Occurs as detrital grains in clastic rocks. Often embedded in feldspar and quartz. Coarse-crystalline apatite occurs in granitic pegmatites and ore veins. Sometimes a petrifying material of wood.',
          'Associated Minerals': 'Associated with most minerals, but found as large crystals associated with quartz, feldspar, tourmaline, muscovite, and beryl.',
          'mindat.org link': 'https://www.mindat.org/min-29229.html'
        },
        {
          'Name': 'azurite',
          'Mineral': 'Azurite',
          'Formula': 'Cu3(CO3)2(OH)',
          'Crystal System': 'Monoclinic',
          'Hardness': '3.5-4',
          'Distinguishing Features': 'Azure blue color and blue streak. Effervesces in HCl. Vitreous luster, conchoidal fracture. ',
          'Occurrence': 'Secondary mineral in Cu-bearing hydrothermal deposits.',
          'Associated Minerals': 'Malachite, chalcopyrite',
          'mindat.org link': 'https://www.mindat.org/min-447.html'
        },
        {// Meta & Ign
          'Name': 'beryl',
          'Mineral': 'Beryl',
          'Formula': 'Al2Be3Si6O18',
          'Crystal System': 'Hexagonal',
          'Hardness': '7.5-8',
          'Distinguishing Features': 'Usually forms as hexagonal prisms with blunt terminations. Also occurs as anhedral or interstitial grains. Often vertically striated. Conchoidal fracture, vitreous to resinous or waxy luster. Blue, green, yellow, pink, white coloration. Easily confused with quartz, but beryl has higher specific gravity.',
          'Occurrence': 'Granitic pegmatite. Less commonly found in granite and nepheline syenite or contact metamorphosed gneiss, mica schists, or carbonates.',
          'Associated Minerals': 'Quartz, K-feldspar, albite, muscovite, biotite, tourmaline. In high temperature hydrothermal veins, associated with Sn and W minerals.',
          'mindat.org link': 'https://www.mindat.org/min-819.html'
        },
        {// Meta & Ign
          'Name': 'biotite',
          'Mineral': 'Biotite',
          'Formula': 'K(Fe,Mg)3AlSi3O10(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '2-3',
          'Distinguishing Features': 'Perfect cleavage (one plane) and micaceous crystal habit. Vitreous luster. Usually black or brown, but can be nearly colorless. Alters to chlorite. Weathering may change appearance to golden yellow color with bronze luster.',
          'Occurrence': 'Good crystals found in pegmatites. Common as disseminated grains in silicic, alkalic, and mafic igneous rocks. Metamorphic rocks such as hornfels, phyllites, schists,  and gneisses. Mg-rich biotite (phlogopite) found in some carbonates and marble. Often a component of immature sediments. ',
          'Associated Minerals': 'Feldspars, muscovite. Indicator of rare-earth minerals when found in pegmatites.',
          'mindat.org link': 'https://www.mindat.org/min-677.html'
        },
        {// Meta
          'Name': 'brucite',
          'Mineral': 'Brucite',
          'Formula': 'Mg(OH)2',
          'Crystal System': 'Hexagonal',
          'Hardness': '2.5',
          'Distinguishing Features': 'Hexagonal, platey crystal habit, often occurring in foliated or swirled masses, aggregates, or granular masses. Perfect cleavage. Vitreous, pearly, or waxy luster. White, gray, pale green, brown, or blue color. Harder than talc or gypsum. Less greasy than talc.',
          'Occurrence': 'Occurs in marble as alteration product of periclase. Forms as small veins in serpentinite and chlorite schist.',
          'Associated Minerals': 'Talc, magnesite, Mg-bearing minerals',
          'mindat.org link': 'https://www.mindat.org/min-820.html'
        },
        {// Meta & Ign & Sed
          'Name': 'calcite',
          'Mineral': 'Calcite',
          'Formula': 'CaCO3',
          'Crystal System': 'Hexagonal',
          'Hardness': '2.5-3',
          'Distinguishing Features': 'Hardness, rhombohedral cleavage, may exhibit llamelar twinning. Can be microcrystalline to coarse grained, and exhibits a huge variety of crystal habits. Effervesces in HCl. Aragonite also effervesces, but has no cleavage.',
          'Occurrence': 'Widely distributed, all rock classes. In clastic sedimentary rocks as a cementing agent or fossils (also chemically precipitates). Limestone, marble, evaporite deposits, hydrothermal deposits. Sometimes found in silica-poor, alkali-rich igneous rocks.',
          'Associated Minerals': 'Diopside, tremolite, olivine, garnet, wollastonite, calc-silicates',
          'mindat.org link': 'https://www.mindat.org/min-859.html'
        },
        {// Meta & Ign
          'Name': 'chalcopyrite',
          'Mineral': 'Chalcopyrite',
          'Formula': 'CuFeS2',
          'Crystal System': 'Tetragonal',
          'Hardness': '3.5-4',
          'Distinguishing Features': 'Metallic luster. Brassy, iridescent yellow, greenish-black streak, sphenoidal crystals, "peacock-colored" iridescent sheen.',
          'Occurrence': 'Hydrothermal sulfide deposits, disseminated in igneous rocks. Also forms as a biomineral.',
          'Associated Minerals': 'Galena, sphalerite, pyrite, pyrrhotite, other sulfide minerals',
          'mindat.org link': 'https://www.mindat.org/min-955.html'
        },
        {// Sed
          'Name': 'chert',
          'Mineral': 'Chert',
          'Formula': 'SiO2',
          'Crystal System': 'N/A',
          'Hardness': '6.5-7',
          'Distinguishing Features': 'Fine granular microcrystalline quartz aggregates; waxy, dull luster; brittle; splintery, subconchoidal, or conchoidal fracture',
          'Occurrence': 'Common as nodules or irregular beds in limestone, silica-rich biogenic recrystallization; banded-iron formations',
          'Associated Minerals': 'Quartz, carbonates',
          'mindat.org link': 'https://www.mindat.org/min-994.html'
        },
        {// Meta & Ign
          'Name': 'chlorite',
          'Mineral': 'Chlorite',
          'Formula': '(Mg,Fe,Al)6(Si,Al)4O10(OH)8',
          'Crystal System': 'Monoclinic',
          'Hardness': '2-3',
          'Distinguishing Features': 'Crystal habit, perfect cleavage (one plane), and green to yellow coloration. Folia are flexible but inelastic. Luster can be pearly, waxy, or dull.',
          'Occurrence': 'Low- and medium-grade pelitic and mafic metamorphic rocks, chlorite schists. Common in igneous rocks (product of hornblende and biotite alteration). Also common in soil and sediments (component of clays). Mostly a product of primary iron, magnesium, and aluminum silicates.',
          'Associated Minerals': 'Biotite, hornblende, garnet, olivine. May replace feldspars. ',
          'mindat.org link': 'https://www.mindat.org/min-1016.html'
        },
        {// Meta
          'Name': 'chloritoid',
          'Mineral': 'Chloritoid',
          'Formula': '(Fe,Mg,Mn)2(Al,Fe)Al3O2(SiO4)2(OH)4',
          'Crystal System': 'Monoclinic',
          'Hardness': '6.5',
          'Distinguishing Features': 'Platy crystal habit, hexagonal outline, forms as coarsely foliated masses. Pearly luster on cleavage surfaces. Drak gray, greenish gray, or greenish black color. Streak is sometimes slightly greenish. Difficult to distinguish from chlorite in hand sample. Lacks perfect cleavage of micas.',
          'Occurrence': 'Porphyroblasts in regionally metamorphosed rocks (mica-, chlorite-, glaucophane- schists), phyllite, quartzite. Also forms in quartz-carbonate veins and as a product of hydrothermal alteration.',
          'Associated Minerals': 'Aluminum silicates, chlorite, garnet, staurolite, muscovite, corundum. Often contains inclusions of associated minerals (e.g. magnetite, ilmenite, rutile, quartz)',
          'mindat.org link': 'https://www.mindat.org/min-1017.html'
        },
        {// Ing
          'Name': 'chromite',
          'Mineral': 'Chromite',
          'Formula': 'FeCr2O4',
          'Crystal System': 'Isometric',
          'Hardness': '5.5-6',
          'Distinguishing Features': 'Octahedral crystals, may be modified by cube faces; massive granular or anhedral grains; resembles magnetite and ilmenite but lacks magnetism (may have some magnetism due to intergrown magnetism)',
          'Occurrence': 'Accessory mineral in mafic, ultramafic rocks; masses generated by crystal settling; concentrated in detrital sands',
          'Associated Minerals': 'Quartz, plagioclase, olivine, pyroxenes',
          'mindat.org link': 'https://www.mindat.org/min-1036.html'
        },
        {// Meta & Ign & Sed
          'Name': 'clays',
          'Mineral': 'Clays',
          'Formula': 'Hydrous aluminosilicates, some containing Mg, Fe, K, Na, Ca, and other cations',
          'Crystal System': 'Variable',
          'Hardness': '1-3',
          'Distinguishing Features': 'Earthy luster and hardness. Too fine grained to recognize grains in hand sample. Clays encompass a collection of sheet silicate minerals including kaolinite, smectite, illite, and chlorite. ',
          'Occurrence': 'Often form as a result of weathering or alteration. Most often found as aggregates of clay-sized grains in sedimentary rocks. ',
          'Associated Minerals': 'Huge variety of associated minerals.',
          'mindat.org link': 'https://www.mindat.org/min-1062.html'
        },
        {// Meta & Ign
          'Name': 'clinopyroxene',
          'Mineral': 'Clinopyroxene Augite',
          'Formula': 'Ca(Fe,Mg)Si2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Dark green to greenish-black color, hardness, and two planes of cleavage. Often forms slender crystals.',
          'Occurrence': 'Forms predominately in intrusive mafic rocks (gabbro, pyroxenite, anorthosite, norite, peridotite). Also found in basalt and andesite, amphibolite, hornblende gneiss, skarns, marble, granulite. ',
          'Associated Minerals': 'Orthopyroxene, olivine, plagioclase feldspar, amphiboles. In limestone: amphibole, scapolite, vesuvianite, garnet, spinel, rutile, phlogopite, tourmaline',
          'mindat.org link': 'https://www.mindat.org/min-419.html'
        },
        {// Meta
          'Name': 'clinozoisite',
          'Mineral': 'Clinozoisite',
          'Formula': 'Ca2Al3OOH(Si2O7)(SiO4)',
          'Crystal System': 'Monoclinic',
          'Hardness': '6-7',
          'Distinguishing Features': 'Columnar, braided, or acicular crystal habit. Often anhredral grains, granular aggregates. Single, perfect cleavage and uneven fracture. Pale green to grey color. ',
          'Occurrence': 'Pelites, metacarbonates, felsic to mafic igneous metamorphic rocks. Occurs more often in aluminous rocks. Because it is the iron-free version of epidote, context is the best method to distinguish between the two. ',
          'Associated Minerals': 'Quartz, feldspar, actinolite, chlorite, apatite, titanite',
          'mindat.org link': 'https://www.mindat.org/min-1087.html'
        },
        {// Meta
          'Name': 'cordierite',
          'Mineral': 'Cordierite',
          'Formula': 'Mg2Al4Si5O18',
          'Crystal System': 'Orthorhombic',
          'Hardness': '7',
          'Distinguishing Features': 'Blue color distinguishes cordierite from quartz. Short, prismatic crystals. Vitreous luster. Softer than corundum. Less likely to form euhedral crystals than staurolite and andalusite.',
          'Occurrence': 'Medium- to high-grade pelitic metamorphic rocks. Gneiss, schists and slates modified by extrusive rocks. Common porphyroblast in hornfels.',
          'Associated Minerals': 'Quartz, orthoclase, albite, chlorite, andalusite, sillimanite, kyanite, staurolite, muscovite, biotite, chloritoid',
          'mindat.org link': 'https://www.mindat.org/min-1128.html'
        },
        {// Meta
          'Name': 'corundum',
          'Mineral': 'Corundum',
          'Formula': 'Al2O3',
          'Crystal System': 'Hexagonal',
          'Hardness': '9',
          'Distinguishing Features': 'Hardness is diagnostic. Adamantine luster. Crystal habit is hexagonal prisms capped with pinacoids. Uneven or conchoidal fracture.',
          'Occurrence': 'Plutonic, pegmatitic, and regionally metamorphosed rocks. Al-rich, silica poor rocks, feldspathoidal pegmatites, xenoliths in mafic rocks, Si-poor hornfels. Accessory in nepheline syenites.',
          'Associated Minerals': 'Aluminum silicates, micas, spinel, magnetite. Not found with quartz.',
          'mindat.org link': 'https://www.mindat.org/min-1136.html'
        },
        {// Ign Only
          'Name': 'cr_diopside',
          'Mineral': 'Cr Diopside',
          'Formula': 'Ca(Mg,Cr)Si2O6',
          'Crystal System': 'Hexagonal',
          'Hardness': '3.5-4',
          'Distinguishing Features': 'Emerald green in color. Harder than calcite, usually forms smaller crystals. Can appear pearly or vitreous and have white to pinkish coloration. Only effervesces in HCl if powdered.',
          'Occurrence': 'Ultrmafic rocks (e.g. kimberlite)',
          'Associated Minerals': 'Olivine, phlogopite, garnet, magnetite',
          'mindat.org link': 'https://www.mindat.org/min-1033.html'
        },
        {// Ign Only
          'Name': 'diamond',
          'Mineral': 'Diamond',
          'Formula': 'C',
          'Crystal System': 'Isometric',
          'Hardness': '10',
          'Distinguishing Features': 'Hardness, octahedral crystals (less often cubes, dodecahedrons), perfect cleavage, conchoidal fracture. Adamantine to greasy luster.',
          'Occurrence': 'Ultramafic igneous rocks (kimberlite, peridotite). Found in alluvial deposits of gravel, sand, or clay',
          'Associated Minerals': 'Olivine, pyroxene, garnet, magnetite, phlogopite, quartz, gold, platinum, zircon, rutile, hematite, ilmenite, andalusite, corundum, tourmaline, garnet',
          'mindat.org link': 'https://www.mindat.org/min-1282.html'
        },
        {// Meta
          'Name': 'diopside',
          'Mineral': 'Diopside',
          'Formula': 'CaMgSi2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '5.5-6',
          'Distinguishing Features': 'Euhedral, stubby, tabular crystals. Vitreous luster. Conchoidal fracture. Light green in color. Cleavage at 87o and 93o.',
          'Occurrence': 'Contact and regionally metamorphosed dolomitic limestones. Cr-rich diopside found in ultramafic rocks (e.g. kimberlite). Also skarns, marble, carbonates, and crystalline schists.',
          'Associated Minerals': 'Tremolite-actinolite, grossular garnet, epidote, wollastonite, forsterite, calcite, dolomite. Alters to antigorite and sometimes hornblende.',
          'mindat.org link': 'https://www.mindat.org/min-1294.html'
        },
        {// Meta & Sed
          'Name': 'dolomite',
          'Mineral': 'Dolomite',
          'Formula': 'CaMg(CO3)2',
          'Crystal System': 'Hexagonal',
          'Hardness': '3.5-4',
          'Distinguishing Features': 'Harder than calcite, usually forms smaller crystals. Can appear pearly or vitreous and have white to pinkish coloration. Only effervesces in HCl if powdered.',
          'Occurrence': 'Primarily dolostone. Forms as pearly clusters in low-temperature hydrothermal vein deposits. Also carbonotites, marble, calc-silicate gneiss, and skarn.',
          'Associated Minerals': 'Calcite, tremolite, diopside, garnet. In veins: galena, sphalerite',
          'mindat.org link': 'https://www.mindat.org/min-1304.html'
        },
        {// Meta & Ign
          'Name': 'epidote',
          'Mineral': 'Epidote',
          'Formula': 'Ca2(Al,Fe)3(SiO4)3(OH)',
          'Crystal System': 'Monoclinic',
          'Hardness': '6-7',
          'Distinguishing Features': 'Yellowish-green to pistachio-green color is distinct. Perfect, single cleavage distinguishes epidote from olivine. Common as anhedral grains or masses, but also often exhibits columnar crystal habit.',
          'Occurrence': 'Accessory mineral in regional and contact metamorphic rocks (e.g. pelites, metacarbonates, meta-igneous rocks). Common in hydrothermal systems.',
          'Associated Minerals': 'Quartz, feldspar, actinolite, chlorite',
          'mindat.org link': 'https://www.mindat.org/min-1389.html'
        },
        {// Ign
          'Name': 'fluorite',
          'Mineral': 'Fluorite',
          'Formula': 'CaF2',
          'Crystal System': 'Isometric',
          'Hardness': '4',
          'Distinguishing Features': 'Cubic crystal habit, perfect cleavage, hardness (can be scratched by a nail), vitreous luster',
          'Occurrence': 'Hydrothermal mineral deposits, geodes. Minor constituent of granite, pegmatites, syenite. Sometimes a biological component in sedimentary rocks. ',
          'Associated Minerals': 'Sulfides (e.g. pyrite, galena, sphalerite), carbonates, barite',
          'mindat.org link': 'https://www.mindat.org/min-1576.html'
        },
        {// Meta & Ign
          'Name': 'galena',
          'Mineral': 'Galena',
          'Formula': 'PbS',
          'Crystal System': 'Isometric',
          'Hardness': '2.5',
          'Distinguishing Features': 'Cubic crystal habit, metallic luster, lead-gray color and streak, lightly marks paper, high specific gravity',
          'Occurrence': 'Medium and low-temperature ore veins in hydrothermal sulfide deposits. Some calcite veins and organic-rich marine sediments. ',
          'Associated Minerals': 'Sphalerite, pyrite, chalcopyrite, quartz, calcite, fluorite, barite',
          'mindat.org link': 'https://www.mindat.org/min-1641.html'
        },
        {// Meta & Ign
          'Name': 'garnet',
          'Mineral': 'Garnet',
          'Formula': 'X3Z2(SiO4)3',
          'Crystal System': 'Isometric',
          'Hardness': '6.5-7',
          'Distinguishing Features': 'Hardness, color, vitreous luster. Often forms eu- or subhedral, dodecahedral porphyroblasts.',
          'Occurrence': 'Pyrope: ultramafic igneous rocks, serpentinite; Almandine: mica schist, gneiss; Spessartine: felsic igneous rocks, mica schist, pegmatite, quartzite; Grossular and andradite: schists, metamorphosed carbonate-rich rocks',
          'Associated Minerals': 'Huge variety of associated minerals',
          'mindat.org link': 'https://www.mindat.org/min-10272.html'
        },
        {// Meta
          'Name': 'glaucophane',
          'Mineral': 'Glaucophane',
          'Formula': 'Na2Mg3Al2Si8O22(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Distinguished as an amphibole based on cleavage (56o and 124o). Prismatic, bladed crystal habit. Main diagnostic trait is blue color.',
          'Occurrence': 'High pressure, low temperature regional metamorphic rocks (e.g. blueschist)',
          'Associated Minerals': 'Lawsonite, pumpellyite, chlorite, albite, quartz, jadeite, epidote',
          'mindat.org link': 'https://www.mindat.org/min-1704.html'
        },
        {// Meta & Ign
          'Name': 'goethite',
          'Mineral': 'Goethite',
          'Formula': 'FeO(OH)',
          'Crystal System': 'Orthorhombic',
          'Hardness': '5-5.5',
          'Distinguishing Features': 'Yellow-brown to red color. Adamantine, metallic, silky, or earthy luster. Occurs as fibrous crystals or slender, flattened plates in granular masses or disseminated grains (occasionally radiating). Brown-yellow to yellow streak. Vertical striations on crystals. Perfect cleavage. Crystalline occurrence distinguishes goethite from limonite.',
          'Occurrence': 'Important source of iron. Forms due to alteration of Fe-bearing minerals, in sedimentary iron formations, and occasionally in low temperature hydrothermal veins. Replaces or found as inclusions in quartz, feldspar.',
          'Associated Minerals': 'Limonite, fluorite, barite, hematite, sulphides, siderite, quartz, feldspar',
          'mindat.org link': 'https://www.mindat.org/min-1719.html'
        },
        {// Meta
          'Name': 'graphite',
          'Mineral': 'Graphite',
          'Formula': 'C',
          'Crystal System': 'Hexagonal',
          'Hardness': '1-2',
          'Distinguishing Features': 'Easily marks paper. Platey hexagonal crystal habit in massive, scaly, or granular aggregates. Frequently exhibits radial structure. Perfect cleavage. Greasy feel, black color, and hardness are main distinguishing features. Metallic, dull, or earthy luster.',
          'Occurrence': 'Pelitic metamorphic rocks (phyllite, slate, schist), marble and skarn deposits, metamorphosed coal beds. On rare occasions, occurs as a primary mineral in igneous rocks, pegmatites, meteorites.',
          'Associated Minerals': 'Quartz, spinel, chondrodite, pyroxene, calcite',
          'mindat.org link': 'https://www.mindat.org/min-1740.html'
        },
        {
          'Name': 'gypsum',
          'Mineral': 'Gypsum',
          'Formula': 'CaSO4*2H2O',
          'Crystal System': 'Monoclinic',
          'Hardness': '2',
          'Distinguishing Features': 'Hardness, three planes of cleavage, pearly luster on cleavage surfaces (can also be glassy or silky). Conchoidal, fibrous fracture',
          'Occurrence': 'Marine evaporite deposits, alkaline lakes, efflorescense in desert soils. Altered (hydrated) form of anhydrite.',
          'Associated Minerals': 'Halite, sylvite, calcite, dolomite, anhydrite',
          'mindat.org link': 'https://www.mindat.org/min-1784.html'
        },
        {
          'Name': 'halite',
          'Mineral': 'Halite',
          'Formula': 'NaCl',
          'Crystal System': 'Isometric',
          'Hardness': '2.5',
          'Distinguishing Features': 'Cubic cleavage, salty taste. May have a greasy luster. ',
          'Occurrence': 'Marine evaporite deposits, saline lake deposits and evaporated estuaries. Often interstratified with other sediments.',
          'Associated Minerals': 'Calcite, dolomite, gypsum, anhydrite, sylvite, clays',
          'mindat.org link': 'https://www.mindat.org/min-1804.html'
        },
        {// Meta
          'Name': 'hematite',
          'Mineral': 'Hematite',
          'Formula': 'Fe2O3',
          'Crystal System': 'Hexagonal',
          'Hardness': '5-6',
          'Distinguishing Features': 'Red streak. Platy crystals with hexagonal outline (fine-grained masses of hematite may be oolitic or rounded). Crystalline hematite is metallic. Fine-grained hematite is dull or earthy. ',
          'Occurrence': 'Weathering or alteration of iron-bearing minerals. Large sedimentary deposits and secondary ore deposits after iron sulfides. Crystalline schists. Uncommonly found in igneous rocks (e.g. syenite, trachyte, granite, rhyolite). Product of fumaroles.',
          'Associated Minerals': 'Quartz, carbonates, Fe-silicates. Alters to magnetite, siderite, limonite, pyrite',
          'mindat.org link': 'https://www.mindat.org/min-1856.html'
        },
        {// Meta & Ign
          'Name': 'hornblende',
          'Mineral': 'Hornblende',
          'Formula': '(Na,K)Ca2(Mg,Fe,Al)5(Si,Al)8O22(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Cleavage (56o and 124o), elongate to bladed (often parallel) crystals, dark green-black in color. Vitreous luster.',
          'Occurrence': 'Most common in compositionally intermediate igneous rocks (especially diorite), but somewhat common in mafic and felsic rocks. Medium- to high-grade metamorphic mafic rocks (e.g. amphibolite, hornblende schist)',
          'Associated Minerals': 'Quartz, biotite, plagioclase, orthoclase, pyroxenes. Alters to chlorite, epidote, calcite, siderite, quartz',
          'mindat.org link': 'https://www.mindat.org/min-1930.html'
        },
        {// Meta
          'Name': 'jadeite',
          'Mineral': 'Jadeite',
          'Formula': 'NaAlSi2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '1-6',
          'Distinguishing Features': 'Green color; vitreous luster; stubby or elongate prisms but typically anhedral granules or acicular/fibrous grain aggregates.',
          'Occurrence': 'High-P, moderate-T metamorphic rocks; tyipcally in glaucophane schist, metagraywake',
          'Associated Minerals': 'Albite, glaucophane, lawsonite, quartz, chlorite, garnet, zoisite, tremolite, calcite, aragonite, micas',
          'mindat.org link': 'https://www.mindat.org/min-2062.html'
        },
        {// Meta & Ign
          'Name': 'ilmenite',
          'Mineral': 'Ilmenite',
          'Formula': 'FeTiO3',
          'Crystal System': 'Hexagonal ',
          'Hardness': '5-6',
          'Distinguishing Features': 'Metallic luster, black streak, weak magnetism. Crystals are tabular with hexagonal cross sections.',
          'Occurrence': 'Accessory mineral in igneous and metamorphic rocks. Pegmatites. Commonly forms as exsolution llamelae in magnetite. Large masses in mafic and ultramafic rocks (gabbro, norite, anorthosite).',
          'Associated Minerals': 'Clinopyroxene, orthopyroxene, olivine, plagioclase feldspar, magnetite',
          'mindat.org link': 'https://www.mindat.org/min-2013.html'
        },
        {// Ign Only
          'Name': 'kaersutite',
          'Mineral': 'Kaersutite',
          'Formula': 'NaCa2(Mg,Fe)4TiSi6Al2O22(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Brown or black color. Amphibole cleavage (56o and 124o). Elongate, columnar, fibrous crystal habit.',
          'Occurrence': 'Alkalic volcanic rocks (trachybasalt, trachyandesite), syenite',
          'Associated Minerals': 'Alkali feldspar, anorthite, olivine, clinopyroxene, leucite, analcime',
          'mindat.org link': 'https://www.mindat.org/min-2129.html'
        },
        {// Meta
          'Name': 'kyanite',
          'Mineral': 'Kyanite',
          'Formula': 'Al2SiO5',
          'Crystal System': 'Triclinic',
          'Hardness': '5-7',
          'Distinguishing Features': 'Bladed or columnar crystal habit, perfect cleavage, blue-gray color, splintery. Vitreous to pearly luster.',
          'Occurrence': 'High pressure metamorphic rocks (schists, gneisses)',
          'Associated Minerals': 'Garnet, micas, staurolite, corundum',
          'mindat.org link': 'https://www.mindat.org/min-2303.html'
        },
        {// Meta
          'Name': 'lawsonite',
          'Mineral': 'Lawsonite',
          'Formula': 'CaAl2(Si2O7)(OH)2*2H2O',
          'Crystal System': 'Orthorhombic',
          'Hardness': '6',
          'Distinguishing Features': 'Tabular to acicular crystals with prismatic cross sections, sometimes occurring in granular masses. Perfect, right angle cleavage and vitreous to greasy luster. Colorless, white, blue-green, blue-gray.',
          'Occurrence': 'Glaucophane-schist (blueschist) and other low-temperature, high-pressure metamorphic rocks. Also found less frequently in metamorphosed gabbro and diabase, marble, and chlorite schist.',
          'Associated Minerals': 'Glaucophane, jadeite, chlorite, albite. Replaced by pumpellyite. ',
          'mindat.org link': 'https://www.mindat.org/min-2353.html'
        },
        {// Ign Only
          'Name': 'lepidolite',
          'Mineral': 'Lepidolite',
          'Formula': 'K(Li,Al)3(Si,Al)4O10(F,OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '2.5-4',
          'Distinguishing Features': 'Micaceous crystal habit. Crystals have nearly hexagonal outlines. Forms scaly masses. Perfect cleavage, vitreous luster. Usually lilac or pink color.',
          'Occurrence': 'Li-bearing granitic pegmatite. Rarely found in high temperature hydrothermal deposits and granites.',
          'Associated Minerals': 'Spodumene, amblygonite, quartz, feldspars, tourmaline, beryl, topaz. May replace biotite or muscovite by metasomatism.',
          'mindat.org link': 'https://www.mindat.org/min-2380.html'
        },
        {// Ign Only
          'Name': 'leucite',
          'Mineral': 'Leucite',
          'Formula': 'KAlSi2O6',
          'Crystal System': 'Tetragonal',
          'Hardness': '5.5-6',
          'Distinguishing Features': 'Crystal habit (trapezohedral crystals) and occurrence.  Gray, white, or colorless. Vitreous luster. May be confused with analcime, but leucite often forms as phenocrysts instead of a cavity-filling mineral.',
          'Occurrence': 'K-rich mafic lavas, shallow intrusive rock bodies. Weathers readily, therefore not found in many sediments. ',
          'Associated Minerals': 'Plagioclase, nepheline, sanidine, clinopyroxene, sodic and calcic amphiboles',
          'mindat.org link': 'https://www.mindat.org/min-2465.html'
        },
        {// Meta & Ign
          'Name': 'limonite',
          'Mineral': 'Limonite',
          'Formula': '(Fe, O, OH, H2O)',
          'Crystal System': 'Amorphous',
          'Hardness': '5.5',
          'Distinguishing Features': 'Medium yellow-brown, dull to earthy luster, yellowish-brown streak, powdery. Does not show the fibrous or silky habit of goethite. No cleavage. May be iridescent.',
          'Occurrence': 'Describes a mixture of iron oxide minerals mainly consisting of goethite, along with lepidocrocite and hematite. Component of soils or forms as secondary alteration of hydrothermal sulfide deposits. Also occurs as a biomineral (component of chitin). Produced by the breakdown of iron-bearing minerals (e.g. pyrite, magnetite, biotite). ',
          'Associated Minerals': 'biotite, amphibole, pyroxene, magnetite, hematite, siderite, pyrite, other Fe-bearing minerals ',
          'mindat.org link': 'https://www.mindat.org/min-2402.html'
        },
        {// Meta & Ign
          'Name': 'magnetite',
          'Mineral': 'Magnetite',
          'Formula': 'Fe3O4',
          'Crystal System': 'Isometric',
          'Hardness': '5.5-6.5',
          'Distinguishing Features': 'Magnetic, metallic luster, no cleavage',
          'Occurrence': 'Common component of igneous and metamorphic rocks, contact metamorphosed limestone and dolostone, and clastic sediments.',
          'Associated Minerals': 'Diopside, tremolite, garnet, calcite, dolomite, calc-silicate minerals. Alters to hematite, limonite, siderite.',
          'mindat.org link': 'https://www.mindat.org/min-2538.html'
        },
        {// Meta & Ign
          'Name': 'malachite',
          'Mineral': 'Malachite',
          'Formula': 'Cu2CO3(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '3.5-4',
          'Distinguishing Features': 'Bright green, effervesces in HCl, concentric color banding, parallel fibrous grains. Often silky, but can be adamantine, vitreous or earthy ',
          'Occurrence': 'Cu-bearing hydrothermal deposits. ',
          'Associated Minerals': 'Azurite, chalcopyrite, cuprite, native copper',
          'mindat.org link': 'https://www.mindat.org/min-2550.html'
        },
        {
          'Name': 'marcasite',
          'Mineral': 'Marcasite',
          'Formula': 'FeS2',
          'Crystal System': 'Orthorhombic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Pale brass yellow; body-center orthorhombic lattice habit; tabular crystals; {101} twins common; encrusting or globular masses with radiating internal structure and crystals projecting from the surface',
          'Occurrence': 'Silica-deficient mafic volcanic rocks',
          'Associated Minerals': ' Leucite, K-feldspar, clinopyroxene, Fe-Ti oxides',
          'mindat.org link': ' https://www.mindat.org/min-29310.html'
        },
        {// Ign only
          'Name': 'melilite',
          'Mineral': 'Melilite',
          'Formula': '(Ca,Na)2(Mg,Al)(Si,Al)2O7',
          'Crystal System': 'Tetragonal',
          'Hardness': '5-6',
          'Distinguishing Features': 'Tabular crystals; square, rectangle, octagon cross-sections; anhedral grains; elongate inclusions parallel to c',
          'Occurrence': 'Tetragonal',
          'Associated Minerals': '5-6',
          'mindat.org link': 'Tabular crystals; square',
          'Strabo': ' rectangle',
          'Kobo': ' octagon cross-sections; anhedral grains; elongate inclusions parallel to c',
          '': ''
        },
        {// Ign Only
          'Name': 'microcline',
          'Mineral': 'Microcline',
          'Formula': '(K,Na)AlSi3O8',
          'Crystal System': 'Triclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Visible exsolution lamellae, good cleavage (near 90o), pink color (occasionally blue, green, white, or pale yellow). Commonly alters to sericite and clays.',
          'Occurrence': 'Similar to orthoclase occurrence, but especially common in pegmatites and shear zones. Granite, granodiorite, syenite, granitic pegmatite, high-grade pelitic metamorphic rocks. Low temperature, not often found in volcanic rocks. ',
          'Associated Minerals': 'Quartz, muscovite, biotite',
          'mindat.org link': 'https://www.mindat.org/min-2704.html'
        },
        {
          'Name': 'molybdenite',
          'Mineral': 'Molybdenite',
          'Formula': 'MoS2',
          'Crystal System': 'Hexagonal',
          'Hardness': '1-1.5',
          'Distinguishing Features': 'Metallic luster, lead-grey color with a blue tint, blue-grey streak. Greasy feel.',
          'Occurrence': 'Hydrothermal vein deposits (e.g. porphyry molybdenum deposits, porphyry copper deposits), pegmatites, skarn deposits',
          'Associated Minerals': 'Quartz, pyrite, sphalerite, sulfide minerals',
          'mindat.org link': 'https://www.mindat.org/min-2746.html'
        },
        {// Meta & Ign
          'Name': 'monazite',
          'Mineral': 'Monazite',
          'Formula': '(Ce,La,Th)PO4',
          'Crystal System': 'Monoclinic',
          'Hardness': '5',
          'Distinguishing Features': 'Small, flattened, equant or elongate crystals. Conchoidal to uneven fracture, resinous to waxy luster. Yellow, reddish yellow, reddish brown color. May alter to a limonite-like material along edges, but relatively resistant to weathering. Produces pleochroic haloes in surrounding minerals.',
          'Occurrence': 'Accessory in granite, granitic pegmatite, syenite, carbonatites, metamorphosed dolostone, mica schists, gneisses, granulites. A common component of clastic sediments. Occasionally forms in hydrothermal vein deposits.',
          'Associated Minerals': 'Quartz, K-feldspar, plagioclase (albite), biotite, pyroxenes, carbonates.',
          'mindat.org link': 'https://www.mindat.org/min-2750.html'
        },
        {// Meta & Ign
          'Name': 'muscovite_whi',
          'Mineral': 'Muscovite, White Mica',
          'Formula': 'KAl3Si3O10(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '2-3',
          'Distinguishing Features': 'Platey crystal habit, perfect cleavage. Lighter color than biotite. Colorless to light shades of green/red/brown. Book edges may appear dark. ',
          'Occurrence': 'Igneous and metamorphic rocks. Common  in felsic igneous rocks or as sericite alteration of alkali feldspar. Found in a wide variety of aluminous metamorphic rocks and metapelites, siliclastic sedimentary rocks, and arkosic sandstone.   ',
          'Associated Minerals': 'Orthoclase, quartz, albite, apatite, tourmaline, garnet, beryl',
          'mindat.org link': 'https://www.mindat.org/min-2815.html'
        },
        {// Meta & Ign
          'Name': 'na_pyroxene',
          'Mineral': 'Na Pyroxene',
          'Formula': 'NaFeSi2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '6',
          'Distinguishing Features': 'Blocky prismatic crystal habit, without pointed terminations. Distinguished as a pyroxene by color (dark green, greenish black, or reddish brown), cleavage (approximately 90o) and hardness. Differentiation from other pyroxenes is difficult in hand sample.',
          'Occurrence': 'Alkali-rich magmas (alkali granite, syenite, nepheline syenite, phonolite), low silica rocks (carbonatites), blueschists in alpine metamorphic belts',
          'Associated Minerals': 'K-feldspar, Na-amphiboles (e.g. riebeckite), feldspathoids, quartz',
          'mindat.org link': 'https://www.mindat.org/min-48005.html'
        },
        {// Ign Only
          'Name': 'nepheline',
          'Mineral': 'Nepheline',
          'Formula': '(Na,K)AlSiO4',
          'Crystal System': 'Hexagonal',
          'Hardness': '5.5-6',
          'Distinguishing Features': 'Poor cleavage, greasy luster. Commonly occurs as anhedral masses, and less commonly as blocky hexagonal crystals with pinacoids. Resembles quartz, but softer. Tabular in igneous rocks and prismatic in geodes.',
          'Occurrence': 'Alkali-rich, silicon-poor igneous rocks. Also contact metamorphosed rocks adjacent to alkali-rich intrusive rocks.',
          'Associated Minerals': 'Kspar, Na-rich plagioclase, biotite, sodic/calcic amphibole or pyroxene, leucite, sodalite. Almost never occurs in large amounts with quartz. ',
          'mindat.org link': 'https://www.mindat.org/min-2880.html'
        },
        {// Meta & Ign
          'Name': 'olivine',
          'Mineral': 'Olivine',
          'Formula': '(Mg,Fe)2SiO4',
          'Crystal System': 'Orthorhombic',
          'Hardness': '6.5-7',
          'Distinguishing Features': 'Olive green color (usually less green than epidote). Conchoidal fracture, vitreous luster. Crystals often flattened, massive, compact, and irregular. ',
          'Occurrence': 'Mafic and ultramafic igneous rocks. Occasionally metamorphosed carbonate bearing rocks.',
          'Associated Minerals': 'Ca-rich plagioclase, clinopyroxene, orthopyroxene, magnetite or calcite, dolomite, diopside, epidote, grossular, tremolite. Alters to iddingsite. ',
          'mindat.org link': 'https://www.mindat.org/min-8658.html'
        },
        {// Meta
          'Name': 'omphacite',
          'Mineral': 'Omphacite',
          'Formula': '(Ca, Na)(Al,Fe,Mg)Si2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Green or dark green color and context are indicative. Forms as stubby, prismatic crystals.',
          'Occurrence': 'High pressure metamorphic rocks (eclogite)',
          'Associated Minerals': 'Garnet, kyanite, quartz, lawsonite, amphiboles',
          'mindat.org link': 'https://www.mindat.org/min-2991.html'
        },
        {// Ign Only
          'Name': 'opaques',
          'Mineral': 'Opaques',
          'Formula': 'Dominantly metal oxides and sulfides',
          'Crystal System': 'Variable',
          'Hardness': 'Variable',
          'Distinguishing Features': 'Cannot always be confidently identified in hand sample, but cleavage, hardness, color and luster are often diagnostic characteristics. Includes magnetite, ilmenite, hematite, pyrite, chalcopyrite, rutile, galena',
          'Occurrence': 'Variable',
          'Associated Minerals': 'Variable',
          'mindat.org link': ''
        },
        {// Meta & Ign
          'Name': 'orthoclase',
          'Mineral': 'Orthoclase',
          'Formula': '(K, Na)AlSi3O8',
          'Crystal System': 'Monoclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Good cleavage (90o), Carlsbad twinning, often occurs as phenocrysts, commonly alters to sericite and clay. Often clear and glassy in comparison with microcline and sanidine. Colored, but often less strongly than microcline.',
          'Occurrence': 'Igneous rocks, contact zones and other metamorphic rocks',
          'Associated Minerals': 'Quartz, muscovite, biotite',
          'mindat.org link': 'https://www.mindat.org/min-3026.html'
        },
        {// Meta & Ign
          'Name': 'orthopyroxene',
          'Mineral': 'Orthopyroxene (Hypersthene)',
          'Formula': '(Mg,Fe)2Si2O6',
          'Crystal System': 'Orthorhombic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Euhedral crystals and stubby prisms. Right-angle cleavage.  Brown coloring. Difficult to distinguish from clinopyroxene.',
          'Occurrence': 'Mafic and ultramafic igneous rocks and porphyries. Higher iron content orthopyroxene found in diorite, syenite, and granite. Also found in high-grade metamorphic rocks.',
          'Associated Minerals': 'Feldspars, clinopyroxene, hornblende, biotite, garnet',
          'mindat.org link': 'https://www.mindat.org/min-10967.html'
        },
        {// Ign Only
          'Name': 'perovskite',
          'Mineral': 'Perovskite',
          'Formula': 'CaTiO3',
          'Crystal System': 'Orthorhombic',
          'Hardness': '5.5',
          'Distinguishing Features': 'Crystals usually cubic. Poor cleavage. Complex twinning occurs in large crystals. Yellow, reddish, brown, or black in color.',
          'Occurrence': 'Regional and contact metamorphosed rocks, alkaline basalts.',
          'Associated Minerals': 'Chlorite, serpentine. Alteration product of ilmenite.',
          'mindat.org link': 'https://www.mindat.org/min-3166.html'
        },
        {
          'Name': 'piemontite',
          'Mineral': 'Piemontite',
          'Formula': 'Ca2(Al,Mn3+,Fe3+)3O(OH)Si2O7SiO4',
          'Crystal System': 'Monoclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Columnar, bladed, acicular crystals; anhedral grains and aggregates; vitreous luster; red, reddish-brown, reddish-violet, reddish-black',
          'Occurrence': 'Greenschist and amphibolite facies metamorphic rocks; low-T hydrothermal veins in volcanic rocks; metasomatized deposits of Mn ore',
          'Associated Minerals': 'Quartz, epidote, calcite, spessartine, chloritoid, tremolite, glaucophane, orthoclase',
          'mindat.org link': 'https://www.mindat.org/min-3208.html'
        },
        {// Meta & Ign
          'Name': 'plagioclase_fs',
          'Mineral': 'Plagioclase Feldspar',
          'Formula': 'NaAlSi3O8 - CaAl2Si2O8',
          'Crystal System': 'Triclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Good cleavage (nearly 90o), parallel striations, most commonly a grey-white color',
          'Occurrence': 'Abundant in igneous rocks. Detrital mineral in sedimentary rocks, but susceptible to weathering. Often occurs in metamorphic rocks as albite. Anorthite found in metamorphosed carbonates, amphibolites. ',
          'Associated Minerals': 'Clinopyroxene, orthopyroxene, olivine, quartz, muscovite, biotite',
          'mindat.org link': 'https://www.mindat.org/min-3231.html'
        },
        {// Meta Only
          'Name': 'pumpellyite',
          'Mineral': 'Pumpellyite',
          'Formula': 'Ca2MgAl2[SiO4][Si2O7](OH)2·H2O',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Green, bluish-green,  brown, greenish-black; distinct {001} cleavage and fair {100} cleavage at 97°',
          'Occurrence': 'Glaucophane schist and related low-T, high-P metamorphic rocks; may fill vesicles in metamorphose or hydrothermally altered mafic igenous rocks (basalt); uncommon in skarns and metamorphosed carbonate rocks; detrital grains',
          'Associated Minerals': 'Glaucophane, lawsonite, clinozoisite, epidote, chlorite, actinolite, calcite',
          'mindat.org link': 'https://www.mindat.org/min-3305.html'
        },
        {// Meta & Ign
          'Name': 'pyrite',
          'Mineral': 'Pyrite',
          'Formula': 'FeS2',
          'Crystal System': 'Isometric',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Cubic crystal habit, metallic luster, pale brassy yellow, greenish-black streak. Hardness and lighter yellow color distinguish it from chalcopyrite.',
          'Occurrence': 'Hydrothermal sulfide deposits, igneous rocks of nearly any composition. Some metamorphic rocks. Fine grained pyrite in coal and shale.',
          'Associated Minerals': 'Other sulfide minerals (galena, sphalerite, molybdenite), quartz, sericite',
          'mindat.org link': 'https://www.mindat.org/min-3314.html'
        },
        {// Meta
          'Name': 'pyrophyllite',
          'Mineral': 'Pyrophyllite',
          'Formula': 'Al2Si4O10(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '1-2',
          'Distinguishing Features': 'Foliated, radiating, columnar, or aggregates of mica-like flakes or fibers. Perfect cleavage, pearly to dull luster, hardness. Inelastic. Difficult to distinguish from talc.',
          'Occurrence': 'Low-grade, Al-rich metamorphic rocks, schists.',
          'Associated Minerals': 'Sometimes a result of hydrothermal alteration of aluminous minerals. Feldspars, muscovite, alminimum silicates, corundum, topaz.',
          'mindat.org link': 'https://www.mindat.org/min-3323.html'
        },
        {// Meta & Ign
          'Name': 'pyrrhotite',
          'Mineral': 'Pyrrhotite',
          'Formula': 'Fe7S8',
          'Crystal System': 'Monoclinic ',
          'Hardness': '3.5-4.5',
          'Distinguishing Features': 'Often crystallizes as hexagonal plates. Simple or repeated twinning. No cleavage, uneven to subconchoidal fracture. Metallic luster. Bronze-yellow color (darker than pyrite) with red-brown cast. Easily tarnished and exhibits iridescence. Dark, grey-black streak. Magnetic, but highly variable in intensity.',
          'Occurrence': 'High temperature hydrothermal sulfide deposits, mafic and ultramafic igneous rocks, pegmatites, contact metamorphosed deposits. Can form as a biomineral. Troilite (FeS), a related, non-magnetic mineral, is found in meteorites. ',
          'Associated Minerals': 'Pyrite, marcasite, chalcopyrite, magnetite, galena, other sulfides.',
          'mindat.org link': 'https://www.mindat.org/min-3328.html'
        },
        {// Meta & Ign & Sed
          'Name': 'quartz',
          'Mineral': 'Quartz',
          'Formula': 'SiO2',
          'Crystal System': 'Hexagonal',
          'Hardness': '7',
          'Distinguishing Features': 'Hardness, conchoidal fracture, vitreous luster, distinct crystals. Beryl is often blue or green, and opal is softer. ',
          'Occurrence': 'Most igneous, metamorphic, and sedimentary rocks.',
          'Associated Minerals': 'Huge variety. Uncommon in low silica environments.',
          'mindat.org link': 'https://www.mindat.org/min-3337.html'
        },
        {// Meta & Ign
          'Name': 'rutile',
          'Mineral': 'Rutile',
          'Formula': 'TiO2',
          'Crystal System': 'Tetragonal',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Adamantine or metallic luster. Red-brown color. Crystals may form as striated prisms or finely fibrous crystals.',
          'Occurrence': 'Usually fine-grained and difficult to idenitfy, but often occurs as an accessory mineral in metamorphic and igneous rocks (granite, gneiss, mica schist, syenitic rocks, amphibolites). Sometimes granular limestone and dolomite.',
          'Associated Minerals': 'Quartz, calcite, topaz, sphalerite. Alters to ilmenite.',
          'mindat.org link': 'https://www.mindat.org/min-3486.html'
        },
        {// Meta & Ign
          'Name': 'sanidine',
          'Mineral': 'Sanidine',
          'Formula': '(K, Na)AlSi3O8',
          'Crystal System': 'Monoclinic',
          'Hardness': '6-6.5',
          'Distinguishing Features': 'Good cleavage (90o), common as phenocrysts. Colorless to white, vitreous luster, carlsbad twinning. Alters to sericite and clay.',
          'Occurrence': 'Silicic volcanic rocks (e.g. rhyolite, trachyte). High temperature.',
          'Associated Minerals': 'Quartz, muscovite, biotite',
          'mindat.org link': 'https://www.mindat.org/min-3521.html'
        },
        {// Meta
          'Name': 'sapphirine',
          'Mineral': 'Sapphirine',
          'Formula': 'Mg4(Mg3Al9)O4(Si3Al9O36)',
          'Crystal System': 'Monoclinic',
          'Hardness': '7.5',
          'Distinguishing Features': 'Strongly resembles blue corundum, but softer. Tabular crystal habit, light to dark blue (occasionally green, white, red or yellow). Often occurs as disseminated grains.',
          'Occurrence': 'Aluminous metamorphic rocks (mica schists and gneisses)',
          'Associated Minerals': 'Spinel, sillimanite, pale green hornblende, cordierite, anorthite',
          'mindat.org link': 'https://www.mindat.org/min-3531.html'
        },
        {// Meta
          'Name': 'serpentine',
          'Mineral': 'Serpentine',
          'Formula': 'Mg3Si2O5(OH)4',
          'Crystal System': 'Monoclinic',
          'Hardness': '2.5-3.5',
          'Distinguishing Features': 'Greasy or waxy luster (chrysotile is silky), usually shades of green (although susceptible to magnetite staining). Fibrous or fine-grained masses. Conchoidal or splintery fracture.',
          'Occurrence': 'Hydrothermally altered mafic and ultramafic rocks. Serpentinite, peridotite, pyroxenite. ',
          'Associated Minerals': 'Magnetite, talc, calcite, brucite, chlorite, chromite, olivine, pyroxenes, amphiboles',
          'mindat.org link': 'https://www.mindat.org/min-11135.html'
        },
        {// Meta
          'Name': 'sillimanite',
          'Mineral': 'Sillimanite',
          'Formula': 'Al2SiO5',
          'Crystal System': 'Orthorhombic',
          'Hardness': '6.5-7.5',
          'Distinguishing Features': 'Fibrous crystal habit, may form swirled or matted aggregates. Satiny luster. Sometimes partially replaced by muscovite. Only one plane of cleavage.',
          'Occurrence': 'Medium pressure, high temperature metamorphic rocks. Mica schists and gneisses. ',
          'Associated Minerals': 'Muscovite, corundum, often intergrown with andalusite',
          'mindat.org link': 'https://www.mindat.org/min-3662.html'
        },
        {// Meta & Ign
          'Name': 'sphalerite',
          'Mineral': 'Sphalerite',
          'Formula': 'ZnS',
          'Crystal System': 'Isometric',
          'Hardness': '3.5-4',
          'Distinguishing Features': 'Tetrahedral crystals with triangular markings on faces; also cubes and dodecahedrons, cleavable masses, encrusting aggregates. Conchoidal fracture. Resinous, adamantine, or submetallic luster. Pale yellow, honey brown, black, red, green, or white color, with a white to light brown streak. Often confused with galena, but distinguished by streak. Twinning common.',
          'Occurrence': 'Hydrothermal sulfide deposits. Also an accessory mineral in felsic igneous rocks and coal beds. Can also be biologically precipitated.',
          'Associated Minerals': 'Galena, pyrite, chalcopyrite, pyrrhotite, calcite, fluorite, barite, quartz, carbonates, sulfates',
          'mindat.org link': 'https://www.mindat.org/min-3727.html'
        },
        {// Meta & Ign
          'Name': 'spinel',
          'Mineral': 'Spinel',
          'Formula': 'MgAl2O4',
          'Crystal System': 'Isometric',
          'Hardness': '7.5-8',
          'Distinguishing Features': 'Octahedral or cubic crystal habit, hardness, often green or blue-green, but can be colorless. Conchoidal fracture. ',
          'Occurrence': 'Aluminous metamorphic rocks, contact or regionally metamorphosed limestone and dolostone, ultramafic rocks. Occasionally granitic pegmatites and hydrothermal veins.',
          'Associated Minerals': 'Andalusite, kyanite, sillimanite, cordierite, corundum, magnetite, calcite',
          'mindat.org link': 'https://www.mindat.org/min-3729.html'
        },
        {// Ign Only
          'Name': 'spodumene',
          'Mineral': 'Spodumene',
          'Formula': 'LiAlSi2O6',
          'Crystal System': 'Monoclinic',
          'Hardness': '6.5-7',
          'Distinguishing Features': 'Prismatic, octagonal, often vertically striated crystals (also acicular and cleavable masses). Perfect pyroxene (~90o) cleavage. Vitreous luster. Color is white, greyish-white, pale shades of blue, green, or yellow. Exhibits splintery fracture.',
          'Occurrence': 'Li-bearing pegmatites.',
          'Associated Minerals': 'Quartz, K-feldspar, plagioclase, tourmaline, beryl, lepidolite, spessartine, aquamarine. May alter to albite and eucryptite.',
          'mindat.org link': 'https://www.mindat.org/min-3733.html'
        },
        {// Meta
          'Name': 'staurolite',
          'Mineral': 'Staurolite',
          'Formula': 'Fe2Al9O6((Si,Al)O4)4(OH)2',
          'Crystal System': 'Monoclinic ',
          'Hardness': '7-7.5',
          'Distinguishing Features': 'Cross-shaped twins, elongate, prismatic crystal habit with pinacoids, poor cleavage, brown color, vitreous luster',
          'Occurrence': 'Medium-grade pelitic metamorphic rocks (schists).',
          'Associated Minerals': 'Garnet, sillimanite, kyanite, tourmaline, cordierite, chloritoid, aluminum silicates, muscovite, biotite',
          'mindat.org link': 'https://www.mindat.org/min-3753.html'
        },
        {// Meta
          'Name': 'talc',
          'Mineral': 'Talc',
          'Formula': 'Mg3Si4O10(OH)2',
          'Crystal System': 'Triclinic',
          'Hardness': '1',
          'Distinguishing Features': 'Waxy feel, pearly or greasy luster, aggregates of irregular flakes and fibers, perfect, micaceous cleavage. Hardness, soapy feel. Often fine-grained and massive ("soapstone" form)',
          'Occurrence': 'Hydrothermally altered mafic and ultramafic rocks. Metamorphism of dolomite.  Schists.',
          'Associated Minerals': 'Serpentine, magnesite, olivine, tourmaline, pyroxene or calcite, dolomite, tremolite',
          'mindat.org link': 'https://www.mindat.org/min-3875.html'
        },
        {// Meta & Ign
          'Name': 'titanite',
          'Mineral': 'Titanite',
          'Formula': 'CaTiSiO5',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-5.5',
          'Distinguishing Features': 'Wedge-shaped crystals, resinous luster, often a honey-brown color',
          'Occurrence': 'Accessory mineral in many igneous rocks or mafic metamorphic rocks (hornblende granites, syenites, diorites, schists, gneisses). Also a heavy mineral in clastic sedimentary rocks.',
          'Associated Minerals': 'Pyroxene, amphibole, chlorite, scapolite, zircon, apatite, quartz',
          'mindat.org link': 'https://www.mindat.org/min-3977.html'
        },
        {
          'Name': 'topaz',
          'Mineral': 'Topaz',
          'Formula': 'Al2SiO4(F,OH)2',
          'Crystal System': 'Orthorhombic',
          'Hardness': '8',
          'Distinguishing Features': 'Stubby or elongate prisms parallel to c axis; perfect basal cleavage on {001}; subconchoidal to uneven fracture; high specific gravity',
          'Occurrence': 'Volcanic and intrusive felsic igneous rocks; may fill vesicles/cavities in rhyolitic volcanics; large masses in granitic pegmatite; hydrothermal tungsten, tin, molybdenum, gold deposits; hydrothermally altered rocks near granite intrusions; uncommon in quartzite and schist; occurs as heavy minerals in sediments',
          'Associated Minerals': 'Quartz, albite, muscovite, fluorite, schorl, microcline',
          'mindat.org link': 'https://www.mindat.org/min-3996.html'
        },
        {// Ign Only
          'Name': 'tourmaline',
          'Mineral': 'Tourmaline',
          'Formula': '(Ca,Na,K)(Mg, Fe, Li, Al,Mn)3(Al,Cr,Fe,V)6Si6O18(BO3)3(O,OH)3(F,O,OH)',
          'Crystal System': 'Hexagonal',
          'Hardness': '7',
          'Distinguishing Features': 'Columnar, prismatic crystal habit, rounded triangular cross sections, often vertically striated. Vitreous to resinous luster. Conchoidal fracture. ',
          'Occurrence': 'Granitic pegmatites, felsic igneous rocks, rocks hydrothermally altered adjacent to pegmatitic or felsic intrusive rocks. Accessory in schist, gneiss, quartzite, phyllite, contact metamorphic zones. Resistant to weathering, therefore often found as clasts.',
          'Associated Minerals': 'Muscovite, biotite, quartz, feldspars, beryl',
          'mindat.org link': 'https://www.mindat.org/min-4003.html'
        },
        {// Meta
          'Name': 'tremolite',
          'Mineral': 'Tremolite',
          'Formula': 'Ca2Mg5Si8O22(OH)2',
          'Crystal System': 'Monoclinic',
          'Hardness': '5-6',
          'Distinguishing Features': 'Cleavage, hardness, columnar or bladed crystal habit, white or dark grey to light green color. Often forms as compact masses of slender crystals.',
          'Occurrence': 'Moderately high temperature and pressure conditions in the presence of water. Metamorphosed limestones or dolostones, gneisses and schist with serpentines, granites. Mafic and ultramafic igneous rocks, metagraywacke, blueschist. ',
          'Associated Minerals': 'Calcite, dolomite, forsterite, garnet, diopside, wollastonite, talc, epidote, chlorite',
          'mindat.org link': 'https://www.mindat.org/min-4011.html'
        },
        {// Meta
          'Name': 'vesuvianite',
          'Mineral': 'Vesuvianite',
          'Formula': '(Ca,Na)19(Al,Mg,Fe3+)13(B,Al,Fe)5(Si2O7)4(SiO4)10(OH,F,O)10',
          'Crystal System': 'Tetragonal',
          'Hardness': '6-7',
          'Distinguishing Features': 'Stubby prismatic or pyramidal crystal habit. Can also be massive or form in columnar or radial patterns. Yellow, green, or brown in color. Vitreous luster, poor cleavage. Often resembles garnet, tourmaline, or epidote.',
          'Occurrence': 'Contact-metamorphosed limestone, altered mafic rocks, nepheline syenite, schists, gneiss, amphibolite. Rarely occurs in pegmatite.',
          'Associated Minerals': 'Grossular, phlogopite, diopside, wollastonite, epidote, serpentine, chlorite',
          'mindat.org link': 'https://www.mindat.org/min-4223.html'
        },
        {// Meta
          'Name': 'wollastonite',
          'Mineral': 'Wollastonite',
          'Formula': 'CaSiO3',
          'Crystal System': 'Triclinic',
          'Hardness': '4.5-5',
          'Distinguishing Features': 'White, gray, or pale green. Splintery fracture. Good to perfect cleavage distinguishes it from tremolite. ',
          'Occurrence': 'Metamorphosed limestone and dolomite. Occasionally alkalic igneous rocks.',
          'Associated Minerals': 'Calcite, dolomite, tremolite, epidote, grossular, diospide, garnet, Ca-Mg silicates.',
          'mindat.org link': 'https://www.mindat.org/min-4323.html'
        },
        {// Ign Only
          'Name': 'xenotime',
          'Mineral': 'Xenotime',
          'Formula': 'YPO4',
          'Crystal System': 'Tetragonal',
          'Hardness': '4-5',
          'Distinguishing Features': 'Elongate prismatic crystals (similar to zircon). Uneven to splintery fracture. Vitreous to resinous luster. Usually a yellowish to reddish brown color (sometimes pale yellow, grey, salmon pink, or green). Streak is pale brown, yellowish, or reddish. Softer than zircon and has good cleavage at right angles. Produces pleochroic haloes in surrounding minerals.',
          'Occurrence': 'Accessory in granite, granodiorite, syenite, granitic pegmatite, mica schists, gneiss. Less commonly found in marble. Detrital grain and heavy component of clastic rocks.',
          'Associated Minerals': 'Quartz, K-feldspar, pyroxenes, biotite, muscovite, zircon',
          'mindat.org link': 'https://www.mindat.org/min-6613.html'
        },
        {// Meta & Ign
          'Name': 'zeolite',
          'Mineral': 'Zeolite',
          'Formula': 'Group of hydrated silicates',
          'Crystal System': 'Variable',
          'Hardness': 'Variable',
          'Distinguishing Features': 'Often too fine-grained for idenitification by hand sample. When found as large enough crystals, usually white to colorless (sometimes shades of yellow, pink, brown, or green). Soft, white streak, vitreous luster.',
          'Occurrence': 'Encompasses a large group of hydrated framework silicates that often form as secondary minerals. Occupies vesicles in basalts and andesites, sedimentary and metamorphic rocks, hydrothermally altered volcanics. Analcime can occur as a primary magmatic mineral.',
          'Associated Minerals': 'Prehnite, apophyllite, datolite, pectolite, pyroxenes, plagioclase,  olivine, quartz, feldspars, nephelite, leucite, sodalite, calcite',
          'mindat.org link': 'https://www.mindat.org/min-4395.html'
        },
        {// Meta & Ign
          'Name': 'zircon',
          'Mineral': 'Zircon',
          'Formula': 'ZrSiO4',
          'Crystal System': 'Tetragonal',
          'Hardness': '6.5-7.5',
          'Distinguishing Features': 'Often microscopic prisms, elongate on the c-axis and capped by dipyramids. Adamantine luster, conchoidal fracture. Rarely seen in hand sample.  When enclosed by other minerals (e.g. micas, andalusite, amphiboles, pyroxenes), often bordered by pleochroic haloes.',
          'Occurrence': 'Resistant to weathering and often endures the entirety of the rock cycle. Especially common in granite, nepheline syenite, diorite.',
          'Associated Minerals': 'Huge variety of associated minerals. ',
          'mindat.org link': 'https://www.mindat.org/min-4421.html'
        },
        {// Meta
          'Name': 'zoisite',
          'Mineral': 'Zoisite',
          'Formula': 'Ca2Al3OOH(Si2O7)(SiO4)',
          'Crystal System': 'Orthorhombic',
          'Hardness': '6-7',
          'Distinguishing Features': 'Most often forms as anhedral grains and granular aggregates, but well-formed crystals are columnar, prismatic, or acicular with vertical striations. Single, perfect cleavage, vitreous luster (pearly on cleavage face). White, grey, greenish brown, greenish grey, or pink color. Similar to epidote and clinozoisite, but less green. ',
          'Occurrence': 'Medium-grade metapelites rich in Ca (calcareous shale, sandstone, or limestone). Less commonly occurs in blueschists, eclogite, quartz veins, pegmatites, ore deposits. Often embedded in quartz or sulfides.',
          'Associated Minerals': 'Quartz, amphiboles (actinolite, glaucophane), plagioclase, chlorite, corundum',
          'mindat.org link': 'https://www.mindat.org/min-4430.html'
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
