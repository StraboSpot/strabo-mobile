(function () {
  'use strict';

  angular
    .module('app')
    .factory('PetrologyFactory', PetrologyFactory);

  function PetrologyFactory() {
    var abbreviationsWithLabels = {};
    var labelsWithAbberviations = {};
    var mineralGlossaryInfo = [
      {
        "Name": "aegirine",
        "Label": "Aegirine",
        "Abbreviation": "aeg",
        "Rock Class": "plutonic",
        "Formula": "NaFeSi2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "6",
        "Distinguishing Features": "Sharply pointed terminations or blocky prismatic crystals, uneven fracture, vitreous luster. Dark green, greenish black, reddish brown. Differentiated from hornblende by acmite's less perfect cleavage. Crystals vertically striated. Polysynthetic twinning common. Pale yellowish-grey streak.",
        "Occurrence": "Alkali-rich magmas (alkali granite, syenite, nepheline syenite, phonolite), low silica rocks (carbonatites)",
        "Associated Minerals": "K-spar, sodic amphiboles, feldspathoids, quartz, nepheline, leucite",
        "mindat.org link": "https://www.mindat.org/min-31.html"
      },
      {
        "Name": "actinolite",
        "Label": "Actinolite",
        "Abbreviation": "act",
        "Rock Class": "metamorphic",
        "Formula": "Ca2(Mg,Fe)5Si8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Good cleavage at 56° and 124°. Elongate, prismatic crystal habit, sometimes fibrous. Often compact masses of slender crystals. Gray green to bright green color due to even minor presence of Fe. White color indicates the mineral is most likely tremolite. ",
        "Occurrence": "Moderately high temperature and pressure conditions in the presence of water, contact metamorphosed rocks, marbles, gneisses and schist with serpentine, granites.  Sometimes found as hair-like inclusions in quartz crystals. Common in mafic and ultramafic igneous rocks, metagraywacke, or blueschist.",
        "Associated Minerals": "Dolomite, forsterite, garnet, diopside, wollastonite. Alters to talc, chlorite, epidote, and calcite.",
        "mindat.org link": "https://www.mindat.org/min-18.html"
      },
      {
        "Name": "albite",
        "Label": "Albite",
        "Abbreviation": "ab",
        "Rock Class": "plutonic",
        "Formula": "NaAlSi3O8 ",
        "Crystal System": "Triclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (nearly 90°), parallel striations, most commonly a gray-white color. Pearly luster.",
        "Occurrence": "Common in pegmatites, veins, and schists. Found in some limestones. Pervasive along feldspar contacts in granites and granodiorites.",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "mindat.org link": "https://www.mindat.org/min-96.html"
      },
      {
        "Name": "allanite",
        "Label": "Allanite",
        "Abbreviation": "aln",
        "Rock Class": "plutonic",
        "Formula": "(Ca,Mn,Ce,La,Y,Th)2Al(Al,Fe)(Fe,Ti)OOH(Si2O7)(SiO4)",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6.5",
        "Distinguishing Features": "Light brown to black color. Columnar, bladed, or elongate grains, and sometimes forms as massive aggregates. Pleochroic haloes may form around allanite enclosed in other minerals, and the crystal structure may become metamict as radioactive elements decay. Subconchoidal fracture. Vitreous, resinous, or submetallic luster.",
        "Occurrence": "Accessory in felsic igneous rocks (granite, syenite, granodiorite, monzonite, etc.) and some felsic volcanic rocks. Occurs in large masses in granitic pegmatite. Skarn deposits, metamorphosed carbonate rocks, amphibolite, granitic gneiss, magnetite-iron ores",
        "Associated Minerals": "Mafic silicates, epidote. Often embedded in feldspar, hornblende, or biotite.",
        "mindat.org link": "https://www.mindat.org/min-46220.html"
      },
      {
        "Name": "amphibole",
        "Label": "Amphibole",
        "Abbreviation": "am, amph",
        "Rock Class": "plutonic, volcanic",
        "Formula": "AX2Z5Si8O22(OH.F,Cl,O)2",
        "Crystal System": "Monoclinic, orthorhombic",
        "Hardness": "5-6",
        "Distinguishing Features": "Cleavage at 56° and 124°, usually dark green to black coloration, elongate prismatic crystal habit, characteristic hardness",
        "Occurrence": "More Si-rich rocks than pyroxene or olivine, intermediate to felsic rocks, medium to high grade metamorphic rocks",
        "Associated Minerals": "Quartz, K-feldspar, biotite, muscovite, plagioclase, orthoclase, pyroxenes",
        "mindat.org link": "https://www.mindat.org/min-207.html"
      },
      {
        "Name": "andalusite",
        "Label": "Andalusite",
        "Abbreviation": "and",
        "Rock Class": "metamorphic",
        "Formula": "Al2SiO5",
        "Crystal System": "Orthorhombic",
        "Hardness": "6.5-7.5",
        "Distinguishing Features": "Forms as square to elongate prismatic porphyroblasts or as irregular masses. Uncolored streak. Frequently riddled with quartz inclusions.",
        "Occurrence": "Low to medium temperature, low pressure metamorphic rocks (e.g. medium-grade mica schist). Contacts between igneous rocks and shales. ",
        "Associated Minerals": "Garnet, muscovite, biotite, hornblende, quartz. Readily alters to sericite.",
        "mindat.org link": "https://www.mindat.org/min-217.html"
      },
      {
        "Name": "anhydrite",
        "Label": "Anhydrite",
        "Abbreviation": "anh",
        "Formula": "CaSO4",
        "Crystal System": "Orthorhombic",
        "Hardness": "3-3.5",
        "Distinguishing Features": "Cubic cleavage, vitreous to pearly luster, uneven to splintery fracture. Colorless, but often exhibits a blue, reddish, or purple hue.",
        "Occurrence": "Marine evaporite deposits, hydrothermally altered limestone, near-surface portion of hydrothermal ore deposits. Easily alters to gypsum.",
        "Associated Minerals": "Calcite, dolomite, gypsum, halite",
        "mindat.org link": "https://www.mindat.org/min-234.html"
      },
      {
        "Name": "antigorite",
        "Label": "Antigorite",
        "Abbreviation": "atg",
        "Rock Class": "metamorphic",
        "Formula": "Mg3(Si2O5)(OH)4",
        "Crystal System": "Monoclinic",
        "Hardness": "2.5-3.5",
        "Distinguishing Features": "perfect {001} cleavage, green, blue-green, softness, silky feel and luster, typically platy crystals, commonly bladed or fibrous",
        "Occurrence": "Commonly replaces ultramafc rocks, pervasively or in crosscutting veinlets. As a replacement of siliceous dolostone along contacts with diabase sills.",
        "Associated Minerals": "Chromite, magnetite, chrysotile, olivine, talc, calcite, brucite, chlorite",
        "mindat.org link": "https://www.mindat.org/min-260.html"
      },
      {
        "Name": "apatite",
        "Label": "Apatite",
        "Abbreviation": "ap",
        "Rock Class": "plutonic",
        "Formula": "Ca5(PO4)3(OH,F,Cl)",
        "Crystal System": "Hexagonal",
        "Hardness": "5",
        "Distinguishing Features": "Hexagonal prismatic crystal habit. Grayish, blue-green color, vitreous luster, conchoidal fracture. Often resembles beryl, but distinguished by hardness. ",
        "Occurrence": "Common consituent of most rocks, but sparse. Skarn, marble, and calc-silicate gneiss. Occurs as detrital grains in clastic rocks. Often embedded in feldspar and quartz. Coarse-crystalline apatite occurs in granitic pegmatites and ore veins. Sometimes a petrifying material of wood.",
        "Associated Minerals": "Associated with most minerals, but found as large crystals associated with quartz, feldspar, tourmaline, muscovite, and beryl.",
        "mindat.org link": "https://www.mindat.org/min-29229.html"
      },
      {
        "Name": "augite",
        "Label": "Augite",
        "Abbreviation": "aug",
        "Rock Class": "plutonic, volcanic",
        "Formula": "(CaxMgyFez)(Mgy1Fez1)Si2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Crystals usually stubby prisms, color ranges from pale green to black, cleavageat 87° and 93°",
        "Occurrence": "Essential in mafc igneous rocks, basalt, gabbro; common in ultramafc rocks; in some high-grade metamorphic rocks and metamorphosed iron formations.",
        "Associated Minerals": "Orthoclase, sanidine, labradorite, olivine, leucite, amphiboles, pyroxenes",
        "mindat.org link": "https://www.mindat.org/min-419.html"
      },
      {
        "Name": "azurite",
        "Label": "Azurite",
        "Abbreviation": "az",
        "Rock Class": "alteration_ore",
        "Formula": "Cu3(CO3)2(OH)",
        "Crystal System": "Monoclinic",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Azure blue color and blue streak. Effervesces in HCl. Vitreous luster, conchoidal fracture. ",
        "Occurrence": "Secondary mineral in Cu-bearing hydrothermal deposits.",
        "Associated Minerals": "Malachite, chalcopyrite",
        "mindat.org link": "https://www.mindat.org/min-447.html"
      },
      {
        "Name": "beryl",
        "Label": "Beryl",
        "Abbreviation": "brl",
        "Formula": "Al2Be3Si6O18",
        "Crystal System": "Hexagonal",
        "Hardness": "7.5-8",
        "Distinguishing Features": "Usually forms as hexagonal prisms with blunt terminations. Also occurs as anhedral or interstitial grains. Often vertically striated. Conchoidal fracture, vitreous to resinous or waxy luster. Blue, green, yellow, pink, white coloration. Easily confused with quartz, but beryl has higher specific gravity.",
        "Occurrence": "Granitic pegmatite. Less commonly found in granite and nepheline syenite or contact metamorphosed gneiss, mica schists, or carbonates.",
        "Associated Minerals": "Quartz, K-feldspar, albite, muscovite, biotite, tourmaline. In high temperature hydrothermal veins, associated with Sn and W minerals.",
        "mindat.org link": "https://www.mindat.org/min-819.html"
      },
      {
        "Name": "biotite",
        "Label": "Biotite",
        "Abbreviation": "bt, bio",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "K(Fe,Mg)3AlSi3O10(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "2-3",
        "Distinguishing Features": "Perfect cleavage (one plane) and micaceous crystal habit. Vitreous luster. Usually black or brown, but can be nearly colorless. Alters to chlorite. Weathering may change appearance to golden yellow color with bronze luster.",
        "Occurrence": "Good crystals found in pegmatites. Common as disseminated grains in silicic, alkalic, and mafic igneous rocks. Metamorphic rocks such as hornfels, phyllites, schists,  and gneisses. Mg-rich biotite (phlogopite) found in some carbonates and marble. Often a component of immature sediments. ",
        "Associated Minerals": "Feldspars, muscovite. Indicator of rare-earth minerals when found in pegmatites.",
        "mindat.org link": "https://www.mindat.org/min-677.html"
      },
      {
        "Name": "brucite",
        "Label": "Brucite",
        "Abbreviation": "brc",
        "Rock Class": "alteration_ore",
        "Formula": "Mg(OH)2",
        "Crystal System": "Hexagonal",
        "Hardness": "2.5",
        "Distinguishing Features": "Hexagonal, platey crystal habit, often occurring in foliated or swirled masses, aggregates, or granular masses. Perfect cleavage. Vitreous, pearly, or waxy luster. White, gray, pale green, brown, or blue color. Harder than talc or gypsum. Less greasy than talc.",
        "Occurrence": "Occurs in marble as alteration product of periclase. Forms as small veins in serpentinite and chlorite schist.",
        "Associated Minerals": "Talc, magnesite, Mg-bearing minerals",
        "mindat.org link": "https://www.mindat.org/min-820.html"
      },
      {
        "Name": "calcite",
        "Label": "Calcite",
        "Abbreviation": "cal",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "CaCO3",
        "Crystal System": "Hexagonal",
        "Hardness": "2.5-3",
        "Distinguishing Features": "Hardness, rhombohedral cleavage, may exhibit llamelar twinning. Can be microcrystalline to coarse grained, and exhibits a huge variety of crystal habits. Effervesces in HCl. Aragonite also effervesces, but has no cleavage.",
        "Occurrence": "Widely distributed, all rock classes. In clastic sedimentary rocks as a cementing agent or fossils (also chemically precipitates). Limestone, marble, evaporite deposits, hydrothermal deposits. Sometimes found in silica-poor, alkali-rich igneous rocks.",
        "Associated Minerals": "Diopside, tremolite, olivine, garnet, wollastonite, calc-silicates",
        "mindat.org link": "https://www.mindat.org/min-859.html"
      },
      {
        "Name": "chalcopyrite",
        "Label": "Chalcopyrite",
        "Abbreviation": "ccp",
        "Formula": "CuFeS2",
        "Crystal System": "Tetragonal",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Metallic luster. Brassy, iridescent yellow, greenish-black streak, sphenoidal crystals, \"peacock-colored\" iridescent sheen.",
        "Occurrence": "Hydrothermal sulfide deposits, disseminated in igneous rocks. Also forms as a biomineral.",
        "Associated Minerals": "Galena, sphalerite, pyrite, pyrrhotite, other sulfide minerals",
        "mindat.org link": "https://www.mindat.org/min-955.html"
      },
      {
        "Name": "chert",
        "Label": "Chert",
        "Abbreviation": "ch",
        "Formula": "SiO2",
        "Crystal System": "Hexagonal",
        "Hardness": "6.5-7",
        "Distinguishing Features": "Fine granular microcrystalline quartz aggregates; waxy, dull luster; brittle; splintery, subconchoidal, or conchoidal fracture",
        "Occurrence": "Common as nodules or irregular beds in limestone, silica-rich biogenic recrystallization; banded-iron formations",
        "Associated Minerals": "Quartz, carbonates",
        "mindat.org link": "https://www.mindat.org/min-994.html"
      },
      {
        "Name": "chlorite",
        "Label": "Chlorite",
        "Abbreviation": "chl",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "(Mg,Fe,Al)6(Si,Al)4O10(OH)8",
        "Crystal System": "Monoclinic",
        "Hardness": "2-3",
        "Distinguishing Features": "Crystal habit, perfect cleavage (one plane), and green to yellow coloration. Folia are flexible but inelastic. Luster can be pearly, waxy, or dull.",
        "Occurrence": "Low- and medium-grade pelitic and mafic metamorphic rocks, chlorite schists. Common in igneous rocks (product of hornblende and biotite alteration). Also common in soil and sediments (component of clays). Mostly a product of primary iron, magnesium, and aluminum silicates.",
        "Associated Minerals": "Biotite, hornblende, garnet, olivine. May replace feldspars. ",
        "mindat.org link": "https://www.mindat.org/min-1016.html"
      },
      {
        "Name": "chloritoid",
        "Label": "Chloritoid",
        "Abbreviation": "cld",
        "Rock Class": "metamorphic",
        "Formula": "(Fe,Mg,Mn)2(Al,Fe)Al3O2(SiO4)2(OH)4",
        "Crystal System": "Monoclinic",
        "Hardness": "6.5",
        "Distinguishing Features": "Platy crystal habit, hexagonal outline, forms as coarsely foliated masses. Pearly luster on cleavage surfaces. Drak gray, greenish gray, or greenish black color. Streak is sometimes slightly greenish. Difficult to distinguish from chlorite in hand sample. Lacks perfect cleavage of micas.",
        "Occurrence": "Porphyroblasts in regionally metamorphosed rocks (mica-, chlorite-, glaucophane- schists), phyllite, quartzite. Also forms in quartz-carbonate veins and as a product of hydrothermal alteration.",
        "Associated Minerals": "Aluminum silicates, chlorite, garnet, staurolite, muscovite, corundum. Often contains inclusions of associated minerals (e.g. magnetite, ilmenite, rutile, quartz)",
        "mindat.org link": "https://www.mindat.org/min-1017.html"
      },
      {
        "Name": "chromite",
        "Label": "Chromite",
        "Abbreviation": "chr",
        "Rock Class": "plutonic, metamorphic",
        "Formula": "FeCr2O4",
        "Crystal System": "Isometric",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Octahedral crystals, may be modified by cube faces; massive granular or anhedral grains; resembles magnetite and ilmenite but lacks magnetism (may have some magnetism due to intergrown magnetism)",
        "Occurrence": "Accessory mineral in mafic, ultramafic rocks; masses generated by crystal settling; concentrated in detrital sands",
        "Associated Minerals": "Quartz, plagioclase, olivine, pyroxenes",
        "mindat.org link": "https://www.mindat.org/min-1036.html"
      },
      {
        "Name": "chrysotile",
        "Label": "Chrysotile",
        "Abbreviation": "ctl",
        "Rock Class": "metamorphic",
        "Formula": "Mg3(Si2O5)(OH)4",
        "Crystal System": "Monoclinic",
        "Hardness": "2.5",
        "Distinguishing Features": "hardness, silky luster, fibrous",
        "Occurrence": "hydrothermal alteration of mafic and ultramafic rocks",
        "Associated Minerals": "other serpentine minerals, lizardite, corundum",
        "mindat.org link": ""
      },
      {
        "Name": "clays",
        "Label": "Clays",
        "Abbreviation": "cl",
        "Rock Class": "alteration_ore",
        "Formula": "Hydrous aluminosilicates, some containing Mg, Fe, K, Na, Ca, and other cations",
        "Crystal System": "Variable",
        "Hardness": "1-3",
        "Distinguishing Features": "Earthy luster and hardness. Too fine grained to recognize grains in hand sample. Clays encompass a collection of sheet silicate minerals including kaolinite, smectite, illite, and chlorite. ",
        "Occurrence": "Often form as a result of weathering or alteration. Most often found as aggregates of clay-sized grains in sedimentary rocks. ",
        "Associated Minerals": "Huge variety of associated minerals.",
        "mindat.org link": "https://www.mindat.org/min-1062.html"
      },
      {
        "Name": "clinopyroxene",
        "Label": "Clinopyroxene",
        "Abbreviation": "cpx",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "XY(Si,Al)2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "Various",
        "Distinguishing Features": "A subgroup name for monoclinic Pyroxene Group minerals. The most widespread members include aegirine, augite, hedenbergite and diopside. ",
        "Occurrence": "Many igneous and metamorphic rocks",
        "Associated Minerals": "Orthopyroxene, olivine, plagioclase feldspar, amphiboles.",
        "mindat.org link": "https://www.mindat.org/min-7630.html"
      },
      {
        "Name": "clinozoisite",
        "Label": "Clinozoisite",
        "Abbreviation": "czo",
        "Rock Class": "metamorphic",
        "Formula": "Ca2Al3OOH(Si2O7)(SiO4)",
        "Crystal System": "Monoclinic",
        "Hardness": "6-7",
        "Distinguishing Features": "Columnar, braided, or acicular crystal habit. Often anhredral grains, granular aggregates. Single, perfect cleavage and uneven fracture. Pale green to grey color. ",
        "Occurrence": "Pelites, metacarbonates, felsic to mafic igneous metamorphic rocks. Occurs more often in aluminous rocks. Because it is the iron-free version of epidote, context is the best method to distinguish between the two. ",
        "Associated Minerals": "Quartz, feldspar, actinolite, chlorite, apatite, titanite",
        "mindat.org link": "https://www.mindat.org/min-1087.html"
      },
      {
        "Name": "cordierite",
        "Label": "Cordierite",
        "Abbreviation": "crd",
        "Rock Class": "metamorphic",
        "Formula": "Mg2Al4Si5O18",
        "Crystal System": "Orthorhombic",
        "Hardness": "7",
        "Distinguishing Features": "Blue color distinguishes cordierite from quartz. Short, prismatic crystals. Vitreous luster. Softer than corundum. Less likely to form euhedral crystals than staurolite and andalusite.",
        "Occurrence": "Medium- to high-grade pelitic metamorphic rocks. Gneiss, schists and slates modified by extrusive rocks. Common porphyroblast in hornfels.",
        "Associated Minerals": "Quartz, orthoclase, albite, chlorite, andalusite, sillimanite, kyanite, staurolite, muscovite, biotite, chloritoid",
        "mindat.org link": "https://www.mindat.org/min-1128.html"
      },
      {
        "Name": "corundum",
        "Label": "Corundum",
        "Abbreviation": "crn",
        "Rock Class": "metamorphic",
        "Formula": "Al2O3",
        "Crystal System": "Hexagonal",
        "Hardness": "9",
        "Distinguishing Features": "Hardness is diagnostic. Adamantine luster. Crystal habit is hexagonal prisms capped with pinacoids. Uneven or conchoidal fracture.",
        "Occurrence": "Plutonic, pegmatitic, and regionally metamorphosed rocks. Al-rich, silica poor rocks, feldspathoidal pegmatites, xenoliths in mafic rocks, Si-poor hornfels. Accessory in nepheline syenites.",
        "Associated Minerals": "Aluminum silicates, micas, spinel, magnetite. Not found with quartz.",
        "mindat.org link": "https://www.mindat.org/min-1136.html"
      },
      {
        "Name": "cr-diopside",
        "Label": "Cr Diopside",
        "Abbreviation": "crdi",
        "Formula": "Ca(Mg,Cr)Si2O6",
        "Crystal System": "Hexagonal",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Emerald green in color. Harder than calcite, usually forms smaller crystals. Can appear pearly or vitreous and have white to pinkish coloration. Only effervesces in HCl if powdered.",
        "Occurrence": "Ultrmafic rocks (e.g. kimberlite)",
        "Associated Minerals": "Olivine, phlogopite, garnet, magnetite",
        "mindat.org link": "https://www.mindat.org/min-1033.html"
      },
      {
        "Name": "diamond",
        "Label": "Diamond",
        "Abbreviation": "dia",
        "Formula": "C",
        "Crystal System": "Isometric",
        "Hardness": "10",
        "Distinguishing Features": "Hardness, octahedral crystals (less often cubes, dodecahedrons), perfect cleavage, conchoidal fracture. Adamantine to greasy luster.",
        "Occurrence": "Ultramafic igneous rocks (kimberlite, peridotite). Found in alluvial deposits of gravel, sand, or clay",
        "Associated Minerals": "Olivine, pyroxene, garnet, magnetite, phlogopite, quartz, gold, platinum, zircon, rutile, hematite, ilmenite, andalusite, corundum, tourmaline, garnet",
        "mindat.org link": "https://www.mindat.org/min-1282.html"
      },
      {
        "Name": "diopside",
        "Label": "Diopside",
        "Abbreviation": "di",
        "Rock Class": "metamorphic",
        "Formula": "CaMgSi2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Euhedral, stubby, tabular crystals. Vitreous luster. Conchoidal fracture. Light green in color. Cleavage at 87° and 93°.",
        "Occurrence": "Contact and regionally metamorphosed dolomitic limestones. Cr-rich diopside found in ultramafic rocks (e.g. kimberlite). Also skarns, marble, carbonates, and crystalline schists.",
        "Associated Minerals": "Tremolite-actinolite, grossular garnet, epidote, wollastonite, forsterite, calcite, dolomite. Alters to antigorite and sometimes hornblende.",
        "mindat.org link": "https://www.mindat.org/min-1294.html"
      },
      {
        "Name": "dolomite",
        "Label": "Dolomite",
        "Abbreviation": "dol",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "CaMg(CO3)2",
        "Crystal System": "Hexagonal",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Harder than calcite, usually forms smaller crystals. Can appear pearly or vitreous and have white to pinkish coloration. Only effervesces in HCl if powdered.",
        "Occurrence": "Primarily dolostone. Forms as pearly clusters in low-temperature hydrothermal vein deposits. Also carbonotites, marble, calc-silicate gneiss, and skarn.",
        "Associated Minerals": "Calcite, tremolite, diopside, garnet. In veins: galena, sphalerite",
        "mindat.org link": "https://www.mindat.org/min-1304.html"
      },
      {
        "Name": "epidote",
        "Label": "Epidote",
        "Abbreviation": "ep",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "Ca2(Al,Fe)3(SiO4)3(OH)",
        "Crystal System": "Monoclinic",
        "Hardness": "6-7",
        "Distinguishing Features": "Yellowish-green to pistachio-green color is distinct. Perfect, single cleavage distinguishes epidote from olivine. Common as anhedral grains or masses, but also often exhibits columnar crystal habit.",
        "Occurrence": "Accessory mineral in regional and contact metamorphic rocks (e.g. pelites, metacarbonates, meta-igneous rocks). Common in hydrothermal systems.",
        "Associated Minerals": "Quartz, feldspar, actinolite, chlorite",
        "mindat.org link": "https://www.mindat.org/min-1389.html"
      },
      {
        "Name": "fe_oxide",
        "Label": "Fe oxide",
        "Abbreviation": "feo",
        "Rock Class": "alteration_ore",
        "Formula": "various",
        "Crystal System": "",
        "Hardness": "",
        "Distinguishing Features": "In petrological terms, \"Iron oxides\" refers usually to the two main iron oxide minerals hematite and magnetite and, to a lesser extent, the rarer oxide mineral maghemite.",
        "Occurrence": "",
        "Associated Minerals": "",
        "mindat.org link": ""
      },
      {
        "Name": "fluorite",
        "Label": "Fluorite",
        "Abbreviation": "fl",
        "Rock Class": "plutonic, metamorphic, alteration_ore",
        "Formula": "CaF2",
        "Crystal System": "Isometric",
        "Hardness": "4",
        "Distinguishing Features": "Cubic crystal habit, perfect cleavage, hardness (can be scratched by a nail), vitreous luster",
        "Occurrence": "Hydrothermal mineral deposits, geodes. Minor constituent of granite, pegmatites, syenite. Sometimes a biological component in sedimentary rocks. ",
        "Associated Minerals": "Sulfides (e.g. pyrite, galena, sphalerite), carbonates, barite",
        "mindat.org link": "https://www.mindat.org/min-1576.html"
      },
      {
        "Name": "galena",
        "Label": "Galena",
        "Abbreviation": "gn",
        "Formula": "PbS",
        "Crystal System": "Isometric",
        "Hardness": "2.5",
        "Distinguishing Features": "Cubic crystal habit, metallic luster, lead-gray color and streak, lightly marks paper, high specific gravity",
        "Occurrence": "Medium and low-temperature ore veins in hydrothermal sulfide deposits. Some calcite veins and organic-rich marine sediments. ",
        "Associated Minerals": "Sphalerite, pyrite, chalcopyrite, quartz, calcite, fluorite, barite",
        "mindat.org link": "https://www.mindat.org/min-1641.html"
      },
      {
        "Name": "garnet",
        "Label": "Garnet",
        "Abbreviation": "grt",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "X3Z2(SiO4)3",
        "Crystal System": "Isometric",
        "Hardness": "6.5-7",
        "Distinguishing Features": "Hardness, color, vitreous luster. Often forms eu- or subhedral, dodecahedral porphyroblasts.",
        "Occurrence": "Pyrope: ultramafic igneous rocks, serpentinite; Almandine: mica schist, gneiss; Spessartine: felsic igneous rocks, mica schist, pegmatite, quartzite; Grossular and andradite: schists, metamorphosed carbonate-rich rocks",
        "Associated Minerals": "Huge variety of associated minerals",
        "mindat.org link": "https://www.mindat.org/min-10272.html"
      },
      {
        "Name": "glaucophane",
        "Label": "Glaucophane",
        "Abbreviation": "gln",
        "Rock Class": "metamorphic",
        "Formula": "Na2Mg3Al2Si8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Distinguished as an amphibole based on cleavage (56° and 124°). Prismatic, bladed crystal habit. Main diagnostic trait is blue color.",
        "Occurrence": "High pressure, low temperature regional metamorphic rocks (e.g. blueschist)",
        "Associated Minerals": "Lawsonite, pumpellyite, chlorite, albite, quartz, jadeite, epidote",
        "mindat.org link": "https://www.mindat.org/min-1704.html"
      },
      {
        "Name": "goethite",
        "Label": "Goethite",
        "Abbreviation": "gt, gth",
        "Formula": "FeO(OH)",
        "Crystal System": "Orthorhombic",
        "Hardness": "5-5.5",
        "Distinguishing Features": "Yellow-brown to red color. Adamantine, metallic, silky, or earthy luster. Occurs as fibrous crystals or slender, flattened plates in granular masses or disseminated grains (occasionally radiating). Brown-yellow to yellow streak. Vertical striations on crystals. Perfect cleavage. Crystalline occurrence distinguishes goethite from limonite.",
        "Occurrence": "Important source of iron. Forms due to alteration of Fe-bearing minerals, in sedimentary iron formations, and occasionally in low temperature hydrothermal veins. Replaces or found as inclusions in quartz, feldspar.",
        "Associated Minerals": "Limonite, fluorite, barite, hematite, sulphides, siderite, quartz, feldspar",
        "mindat.org link": "https://www.mindat.org/min-1719.html"
      },
      {
        "Name": "graphite",
        "Label": "Graphite",
        "Abbreviation": "gr",
        "Rock Class": "metamorphic",
        "Formula": "C",
        "Crystal System": "Hexagonal",
        "Hardness": "1-2",
        "Distinguishing Features": "Easily marks paper. Platey hexagonal crystal habit in massive, scaly, or granular aggregates. Frequently exhibits radial structure. Perfect cleavage. Greasy feel, black color, and hardness are main distinguishing features. Metallic, dull, or earthy luster.",
        "Occurrence": "Pelitic metamorphic rocks (phyllite, slate, schist), marble and skarn deposits, metamorphosed coal beds. On rare occasions, occurs as a primary mineral in igneous rocks, pegmatites, meteorites.",
        "Associated Minerals": "Quartz, spinel, chondrodite, pyroxene, calcite",
        "mindat.org link": "https://www.mindat.org/min-1740.html"
      },
      {
        "Name": "grossular_garnet ",
        "Label": "Grossular Garnet ",
        "Abbreviation": "grs",
        "Formula": "Ca3Al2(SiO4)3",
        "Crystal System": "Isometric",
        "Hardness": "6.5-7",
        "Distinguishing Features": "dodecahedral porphyroblasts, Hardness, color (green, pink, brown)",
        "Occurrence": "In contact and regionally metamorphosed calcareous rocks, or rocks which have undergone calcium metasomatism; in some schists and serpentinites.",
        "Associated Minerals": "Calcite, dolomite, epidote, wollastonite, diopside, tremolite.",
        "mindat.org link": "https://www.mindat.org/min-1755.html"
      },
      {
        "Name": "gypsum",
        "Label": "Gypsum",
        "Abbreviation": "gp",
        "Formula": "CaSO4*2H2O",
        "Crystal System": "Monoclinic",
        "Hardness": "2",
        "Distinguishing Features": "Hardness, three planes of cleavage, pearly luster on cleavage surfaces (can also be glassy or silky). Conchoidal, fibrous fracture",
        "Occurrence": "Marine evaporite deposits, alkaline lakes, efflorescense in desert soils. Altered (hydrated) form of anhydrite.",
        "Associated Minerals": "Halite, sylvite, calcite, dolomite, anhydrite",
        "mindat.org link": "https://www.mindat.org/min-1784.html"
      },
      {
        "Name": "halite",
        "Label": "Halite",
        "Abbreviation": "hl",
        "Formula": "NaCl",
        "Crystal System": "Isometric",
        "Hardness": "2.5",
        "Distinguishing Features": "Cubic cleavage, salty taste. May have a greasy luster. ",
        "Occurrence": "Marine evaporite deposits, saline lake deposits and evaporated estuaries. Often interstratified with other sediments.",
        "Associated Minerals": "Calcite, dolomite, gypsum, anhydrite, sylvite, clays",
        "mindat.org link": "https://www.mindat.org/min-1804.html"
      },
      {
        "Name": "hematite",
        "Label": "Hematite",
        "Abbreviation": "hem, hm",
        "Rock Class": "plutonic, volcanic, metamorphic, alteration_ore",
        "Formula": "Fe2O3",
        "Crystal System": "Hexagonal",
        "Hardness": "5-6",
        "Distinguishing Features": "Red streak. Platy crystals with hexagonal outline (fine-grained masses of hematite may be oolitic or rounded). Crystalline hematite is metallic. Fine-grained hematite is dull or earthy. ",
        "Occurrence": "Weathering or alteration of iron-bearing minerals. Large sedimentary deposits and secondary ore deposits after iron sulfides. Crystalline schists. Uncommonly found in igneous rocks (e.g. syenite, trachyte, granite, rhyolite). Product of fumaroles.",
        "Associated Minerals": "Quartz, carbonates, Fe-silicates. Alters to magnetite, siderite, limonite, pyrite",
        "mindat.org link": "https://www.mindat.org/min-1856.html"
      },
      {
        "Name": "hornblende",
        "Label": "Hornblende",
        "Abbreviation": "hbl",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "(Na,K)Ca2(Mg,Fe,Al)5(Si,Al)8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Cleavage (56° and 124°), elongate to bladed (often parallel) crystals, dark green-black in color. Vitreous luster.",
        "Occurrence": "Most common in compositionally intermediate igneous rocks (especially diorite), but somewhat common in mafic and felsic rocks. Medium- to high-grade metamorphic mafic rocks (e.g. amphibolite, hornblende schist)",
        "Associated Minerals": "Quartz, biotite, plagioclase, orthoclase, pyroxenes. Alters to chlorite, epidote, calcite, siderite, quartz",
        "mindat.org link": "https://www.mindat.org/min-1930.html"
      },
      {
        "Name": "hypersthene",
        "Label": "Hypersthene",
        "Abbreviation": "hyp",
        "Rock Class": "plutonic, volcanic",
        "Formula": "(Mg,Fe)SiO3",
        "Crystal System": "Orthorhombic",
        "Hardness": "5.5-6",
        "Distinguishing Features": " usually found as foliated masses; gray, brown or green; On certain surfaces it displays a brilliant copper-red metallic sheen",
        "Occurrence": "Minerals of basic igneous rocks and meteorites. Intermediate in composition between enstatite and ferrosilite",
        "Associated Minerals": "Olivine, phlogopite, clinopyroxene, diopside, spinel, pyrope, Magnetite, hematite, quartz, almandine",
        "mindat.org link": "https://www.mindat.org/min-1995.html"
      },
      {
        "Name": "ilmenite",
        "Label": "Ilmenite",
        "Abbreviation": "ilm",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "FeTiO3",
        "Crystal System": "Hexagonal ",
        "Hardness": "5-6",
        "Distinguishing Features": "Metallic luster, black streak, weak magnetism. Crystals are tabular with hexagonal cross sections.",
        "Occurrence": "Accessory mineral in igneous and metamorphic rocks. Pegmatites. Commonly forms as exsolution llamelae in magnetite. Large masses in mafic and ultramafic rocks (gabbro, norite, anorthosite).",
        "Associated Minerals": "Clinopyroxene, orthopyroxene, olivine, plagioclase feldspar, magnetite",
        "mindat.org link": "https://www.mindat.org/min-2013.html"
      },
      {
        "Name": "jadeite",
        "Label": "Jadeite",
        "Abbreviation": "jd",
        "Rock Class": "metamorphic",
        "Formula": "NaAlSi2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "1-6",
        "Distinguishing Features": "Green color; vitreous luster; stubby or elongate prisms but typically anhedral granules or acicular/fibrous grain aggregates.",
        "Occurrence": "High-P, moderate-T metamorphic rocks; tyipcally in glaucophane schist, metagraywake",
        "Associated Minerals": "Albite, glaucophane, lawsonite, quartz, chlorite, garnet, zoisite, tremolite, calcite, aragonite, micas",
        "mindat.org link": "https://www.mindat.org/min-2062.html"
      },
      {
        "Name": "kaersutite",
        "Label": "Kaersutite",
        "Abbreviation": "krs",
        "Formula": "NaCa2(Mg,Fe)4TiSi6Al2O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Brown or black color. Amphibole cleavage (56° and 124°). Elongate, columnar, fibrous crystal habit.",
        "Occurrence": "Alkalic volcanic rocks (trachybasalt, trachyandesite), syenite",
        "Associated Minerals": "Alkali feldspar, anorthite, olivine, clinopyroxene, leucite, analcime",
        "mindat.org link": "https://www.mindat.org/min-2129.html"
      },
      {
        "Name": "k-feldspar",
        "Label": "K-feldspar",
        "Abbreviation": "kfs, kspar, kfsp",
        "Rock Class": "plutonic, metamorphic",
        "Formula": "Variable",
        "Crystal System": "Variable",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Potassium-dominant feldspars with unknown crystal symmetry and Al-Si ordering state. Includes microcline, orthoclase and sanidine.",
        "Occurrence": "Common in plutonic felsic rocks, in metamorphic rocks of various grades, and as a result of potassic hydrothermal alteration. A detrital component in sedimentary rocks and as authigenic overgrowths.",
        "Associated Minerals": "Muscovite, biotite, hornblende, quartz, sodic plagioclase",
        "mindat.org link": "https://www.mindat.org/min-9581.html"
      },
      {
        "Name": "kyanite",
        "Label": "Kyanite",
        "Abbreviation": "ky",
        "Rock Class": "metamorphic",
        "Formula": "Al2SiO5",
        "Crystal System": "Triclinic",
        "Hardness": "5-7",
        "Distinguishing Features": "Bladed or columnar crystal habit, perfect cleavage, blue-gray color, splintery. Vitreous to pearly luster.",
        "Occurrence": "High pressure metamorphic rocks (schists, gneisses)",
        "Associated Minerals": "Garnet, micas, staurolite, corundum",
        "mindat.org link": "https://www.mindat.org/min-2303.html"
      },
      {
        "Name": "lawsonite",
        "Label": "Lawsonite",
        "Abbreviation": "lws",
        "Rock Class": "metamorphic",
        "Formula": "CaAl2(Si2O7)(OH)2*2H2O",
        "Crystal System": "Orthorhombic",
        "Hardness": "6",
        "Distinguishing Features": "Tabular to acicular crystals with prismatic cross sections, sometimes occurring in granular masses. Perfect, right angle cleavage and vitreous to greasy luster. Colorless, white, blue-green, blue-gray.",
        "Occurrence": "Glaucophane-schist (blueschist) and other low-temperature, high-pressure metamorphic rocks. Also found less frequently in metamorphosed gabbro and diabase, marble, and chlorite schist.",
        "Associated Minerals": "Glaucophane, jadeite, chlorite, albite. Replaced by pumpellyite. ",
        "mindat.org link": "https://www.mindat.org/min-2353.html"
      },
      {
        "Name": "lepidolite",
        "Label": "Lepidolite",
        "Abbreviation": "lpd",
        "Formula": "K(Li,Al)3(Si,Al)4O10(F,OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "2.5-4",
        "Distinguishing Features": "Micaceous crystal habit. Crystals have nearly hexagonal outlines. Forms scaly masses. Perfect cleavage, vitreous luster. Usually lilac or pink color.",
        "Occurrence": "Li-bearing granitic pegmatite. Rarely found in high temperature hydrothermal deposits and granites.",
        "Associated Minerals": "Spodumene, amblygonite, quartz, feldspars, tourmaline, beryl, topaz. May replace biotite or muscovite by metasomatism.",
        "mindat.org link": "https://www.mindat.org/min-2380.html"
      },
      {
        "Name": "leucite",
        "Label": "Leucite",
        "Abbreviation": "lct",
        "Rock Class": "plutonic, volcanic",
        "Formula": "KAlSi2O6",
        "Crystal System": "Tetragonal",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Crystal habit (trapezohedral crystals) and occurrence.  Gray, white, or colorless. Vitreous luster. May be confused with analcime, but leucite often forms as phenocrysts instead of a cavity-filling mineral.",
        "Occurrence": "K-rich mafic lavas, shallow intrusive rock bodies. Weathers readily, therefore not found in many sediments. ",
        "Associated Minerals": "Plagioclase, nepheline, sanidine, clinopyroxene, sodic and calcic amphiboles",
        "mindat.org link": "https://www.mindat.org/min-2465.html"
      },
      {
        "Name": "limonite",
        "Label": "Limonite",
        "Abbreviation": "lm",
        "Rock Class": "alteration_ore",
        "Formula": "(Fe, O, OH, H2O)",
        "Crystal System": "Amorphous",
        "Hardness": "5.5",
        "Distinguishing Features": "Medium yellow-brown, dull to earthy luster, yellowish-brown streak, powdery. Does not show the fibrous or silky habit of goethite. No cleavage. May be iridescent.",
        "Occurrence": "Describes a mixture of iron oxide minerals mainly consisting of goethite, along with lepidocrocite and hematite. Component of soils or forms as secondary alteration of hydrothermal sulfide deposits. Also occurs as a biomineral (component of chitin). Produced by the breakdown of iron-bearing minerals (e.g. pyrite, magnetite, biotite). ",
        "Associated Minerals": "biotite, amphibole, pyroxene, magnetite, hematite, siderite, pyrite, other Fe-bearing minerals ",
        "mindat.org link": "https://www.mindat.org/min-2402.html"
      },
      {
        "Name": "lizardite",
        "Label": "Lizardite",
        "Abbreviation": "lz",
        "Rock Class": "metamorphic",
        "Formula": "Mg3(Si2O5)(OH)4",
        "Crystal System": "Hexagonal",
        "Hardness": "2.5",
        "Distinguishing Features": "crystals commonly as fine-grained scales and massive aggregates, green color, ",
        "Occurrence": "Typically a product of retrograde metamorphism, replacing olivine, orthopyroxene, or other minerals in ultrama¯c igneous rocks",
        "Associated Minerals": "Chrysotile, brucite, magnetite",
        "mindat.org link": "https://www.mindat.org/min-2425.html"
      },
      {
        "Name": "magnesio-hornblende",
        "Label": "Magnesio-Hornblende",
        "Abbreviation": "mhb, mghbl",
        "Formula": "Ca2[(Mg, Fe 2+)4Al](Si7Al)O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "prismatic crystals, perfect cleavage (56° and 124°), color is green, brown",
        "Occurrence": "Common in amphibolites, schists, and pegmatitic alkalic gabbro. Also from welded tu®s, granodiorites, granites, and tonalites.",
        "Associated Minerals": "Quartz, orthoclase, plagioclase, biotite, magnetite, apatite",
        "mindat.org link": ""
      },
      {
        "Name": "magnetite",
        "Label": "Magnetite",
        "Abbreviation": "mag",
        "Rock Class": "plutonic, volcanic",
        "Formula": "Fe3O4",
        "Crystal System": "Isometric",
        "Hardness": "5.5-6.5",
        "Distinguishing Features": "Magnetic, metallic luster, no cleavage",
        "Occurrence": "Common component of igneous and metamorphic rocks, contact metamorphosed limestone and dolostone, and clastic sediments.",
        "Associated Minerals": "Diopside, tremolite, garnet, calcite, dolomite, calc-silicate minerals. Alters to hematite, limonite, siderite.",
        "mindat.org link": "https://www.mindat.org/min-2538.html"
      },
      {
        "Name": "malachite",
        "Label": "Malachite",
        "Abbreviation": "mlc, mal",
        "Rock Class": "alteration_ore",
        "Formula": "Cu2CO3(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Bright green, effervesces in HCl, concentric color banding, parallel fibrous grains. Often silky, but can be adamantine, vitreous or earthy ",
        "Occurrence": "Cu-bearing hydrothermal deposits. ",
        "Associated Minerals": "Azurite, chalcopyrite, cuprite, native copper",
        "mindat.org link": "https://www.mindat.org/min-2550.html"
      },
      {
        "Name": "marcasite",
        "Label": "Marcasite",
        "Abbreviation": "mrc, mr",
        "Rock Class": "alteration_ore",
        "Formula": "FeS2",
        "Crystal System": "Orthorhombic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Pale brass yellow; body-center orthorhombic lattice habit; tabular crystals; {101} twins common; encrusting or globular masses with radiating internal structure and crystals projecting from the surface",
        "Occurrence": "Silica-deficient mafic volcanic rocks",
        "Associated Minerals": " Leucite, K-feldspar, clinopyroxene, Fe-Ti oxides",
        "mindat.org link": " https://www.mindat.org/min-29310.html"
      },
      {
        "Name": "melilite",
        "Label": "Melilite",
        "Abbreviation": "mll, mel",
        "Formula": "(Ca,Na)2(Mg,Al)(Si,Al)2O7",
        "Crystal System": "Tetragonal",
        "Hardness": "5-6",
        "Distinguishing Features": "Tabular crystals; square, rectangle, octagon cross-sections; anhedral grains; elongate inclusions parallel to c axis",
        "Occurrence": "silica deficient calcium-rich mafic volcanic rocks, metamorphosed carbonate rocks",
        "Associated Minerals": "Dolomite, calcite, augite, diopside, garnet, olivine, nepheline, leucite, calcic plagioclase",
        "mindat.org link": "https://www.mindat.org/min-29310.html"
      },
      {
        "Name": "microcline",
        "Label": "Microcline",
        "Abbreviation": "mc",
        "Rock Class": "plutonic",
        "Formula": "(K,Na)AlSi3O8",
        "Crystal System": "Triclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Visible exsolution lamellae, good cleavage (near 90°), pink color (occasionally blue, green, white, or pale yellow). Commonly alters to sericite and clays.",
        "Occurrence": "Similar to orthoclase occurrence, but especially common in pegmatites and shear zones. Granite, granodiorite, syenite, granitic pegmatite, high-grade pelitic metamorphic rocks. Low temperature, not often found in volcanic rocks. ",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "mindat.org link": "https://www.mindat.org/min-2704.html"
      },
      {
        "Name": "molybdenite",
        "Label": "Molybdenite",
        "Abbreviation": "mol, mo",
        "Rock Class": "alteration_ore",
        "Formula": "MoS2",
        "Crystal System": "Hexagonal",
        "Hardness": "1-1.5",
        "Distinguishing Features": "Metallic luster, lead-grey color with a blue tint, blue-grey streak. Greasy feel.",
        "Occurrence": "Hydrothermal vein deposits (e.g. porphyry molybdenum deposits, porphyry copper deposits), pegmatites, skarn deposits",
        "Associated Minerals": "Quartz, pyrite, sphalerite, sulfide minerals",
        "mindat.org link": "https://www.mindat.org/min-2746.html"
      },
      {
        "Name": "monazite",
        "Label": "Monazite",
        "Abbreviation": "mnz",
        "Rock Class": "plutonic, metamorphic",
        "Formula": "(Ce,La,Th)PO4",
        "Crystal System": "Monoclinic",
        "Hardness": "5",
        "Distinguishing Features": "Small, flattened, equant or elongate crystals. Conchoidal to uneven fracture, resinous to waxy luster. Yellow, reddish yellow, reddish brown color. May alter to a limonite-like material along edges, but relatively resistant to weathering. Produces pleochroic haloes in surrounding minerals.",
        "Occurrence": "Accessory in granite, granitic pegmatite, syenite, carbonatites, metamorphosed dolostone, mica schists, gneisses, granulites. A common component of clastic sediments. Occasionally forms in hydrothermal vein deposits.",
        "Associated Minerals": "Quartz, K-feldspar, plagioclase (albite), biotite, pyroxenes, carbonates.",
        "mindat.org link": "https://www.mindat.org/min-2750.html"
      },
      {
        "Name": "muscovite",
        "Label": "Muscovite",
        "Abbreviation": "ms",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "KAl3Si3O10(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "2-3",
        "Distinguishing Features": "Platey crystal habit, perfect cleavage. Lighter color than biotite. Colorless to light shades of green/red/brown. Book edges may appear dark. ",
        "Occurrence": "Igneous and metamorphic rocks. Common  in felsic igneous rocks or as sericite alteration of alkali feldspar. Found in a wide variety of aluminous metamorphic rocks and metapelites, siliclastic sedimentary rocks, and arkosic sandstone.   ",
        "Associated Minerals": "Orthoclase, quartz, albite, apatite, tourmaline, garnet, beryl",
        "mindat.org link": "https://www.mindat.org/min-2815.html"
      },
      {
        "Name": "na_pyroxene",
        "Label": "Na Pyroxene",
        "Abbreviation": "npx, npyx",
        "Formula": "NaFeSi2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "6",
        "Distinguishing Features": "Blocky prismatic crystal habit, without pointed terminations. Distinguished as a pyroxene by color (dark green, greenish black, or reddish brown), cleavage (approximately 90°) and hardness. Differentiation from other pyroxenes is difficult in hand sample.",
        "Occurrence": "Alkali-rich magmas (alkali granite, syenite, nepheline syenite, phonolite), low silica rocks (carbonatites), blueschists in alpine metamorphic belts",
        "Associated Minerals": "K-feldspar, Na-amphiboles (e.g. riebeckite), feldspathoids, quartz",
        "mindat.org link": "https://www.mindat.org/min-48005.html"
      },
      {
        "Name": "nepheline",
        "Label": "Nepheline",
        "Abbreviation": "nph, ne",
        "Rock Class": "plutonic, volcanic",
        "Formula": "(Na,K)AlSiO4",
        "Crystal System": "Hexagonal",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Poor cleavage, greasy luster. Commonly occurs as anhedral masses, and less commonly as blocky hexagonal crystals with pinacoids. Resembles quartz, but softer. Tabular in igneous rocks and prismatic in geodes.",
        "Occurrence": "Alkali-rich, silicon-poor igneous rocks. Also contact metamorphosed rocks adjacent to alkali-rich intrusive rocks.",
        "Associated Minerals": "Kspar, Na-rich plagioclase, biotite, sodic/calcic amphibole or pyroxene, leucite, sodalite. Almost never occurs in large amounts with quartz. ",
        "mindat.org link": "https://www.mindat.org/min-2880.html"
      },
      {
        "Name": "olivine",
        "Label": "Olivine",
        "Abbreviation": "ol",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "(Mg,Fe)2SiO4",
        "Crystal System": "Orthorhombic",
        "Hardness": "6.5-7",
        "Distinguishing Features": "Olive green color (usually less green than epidote). Conchoidal fracture, vitreous luster. Crystals often flattened, massive, compact, and irregular. ",
        "Occurrence": "Mafic and ultramafic igneous rocks. Occasionally metamorphosed carbonate bearing rocks.",
        "Associated Minerals": "Ca-rich plagioclase, clinopyroxene, orthopyroxene, magnetite or calcite, dolomite, diopside, epidote, grossular, tremolite. Alters to iddingsite. ",
        "mindat.org link": "https://www.mindat.org/min-8658.html"
      },
      {
        "Name": "omphacite",
        "Label": "Omphacite",
        "Abbreviation": "omp",
        "Rock Class": "metamorphic",
        "Formula": "(Ca, Na)(Al,Fe,Mg)Si2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Green or dark green color and context are indicative. Forms as stubby, prismatic crystals.",
        "Occurrence": "High pressure metamorphic rocks (eclogite)",
        "Associated Minerals": "Garnet, kyanite, quartz, lawsonite, amphiboles",
        "mindat.org link": "https://www.mindat.org/min-2991.html"
      },
      {
        "Name": "opaques",
        "Label": "Opaques",
        "Abbreviation": "op",
        "Formula": "Dominantly metal oxides and sulfides",
        "Crystal System": "Variable",
        "Hardness": "Variable",
        "Distinguishing Features": "Cannot always be confidently identified in hand sample, but cleavage, hardness, color and luster are often diagnostic characteristics. Includes magnetite, ilmenite, hematite, pyrite, chalcopyrite, rutile, galena",
        "Occurrence": "Variable",
        "Associated Minerals": "Variable",
        "mindat.org link": ""
      },
      {
        "Name": "orthoamph_ant",
        "Label": "Orthoamphibole (Anthophyllite)",
        "Abbreviation": "",
        "Rock Class": "metamorphic",
        "Formula": "(Mg,Fe)2(Mg,Fe)5Si8O22(OH)2",
        "Crystal System": "Orthorhombic",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Usually brown; perfect {210} cleavage (56°/124°); {100} and {010} cleavages distinguish it from clinoamphibole; elastic fibers; brittle",
        "Occurrence": "Medium-high grade metamorphosed mafic rocks;",
        "Associated Minerals": "Cordierite, garnet, alumino-silicates, plagioclase, staurolite",
        "mindat.org link": "https://www.mindat.org/min-254.html"
      },
      {
        "Name": "orthoamph_ged",
        "Label": "Orthoamphibole (Gedrite)",
        "Abbreviation": "",
        "Rock Class": "metamorphic",
        "Formula": "(Mg,Fe)2(Mg,Fe)3Al2Al2Si6O22(OH)2",
        "Crystal System": "Orthorhombic",
        "Hardness": "5.5-6",
        "Distinguishing Features": "Usually brown; perfect {210} cleavage (56°/124°); {100} and {010} cleavages distinguish it from clinoamphibole; elastic fibers; brittle",
        "Occurrence": "Medium-high grade metamorphosed mafic rocks;",
        "Associated Minerals": "Cordierite, garnet, alumino-silicates, plagioclase, staurolite",
        "mindat.org link": "https://www.mindat.org/min-1665.html"
      },
      {
        "Name": "orthoclase",
        "Label": "Orthoclase",
        "Abbreviation": "or",
        "Rock Class": "plutonic",
        "Formula": "(K, Na)AlSi3O8",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (90°), Carlsbad twinning, often occurs as phenocrysts, commonly alters to sericite and clay. Often clear and glassy in comparison with microcline and sanidine. Colored, but often less strongly than microcline.",
        "Occurrence": "Igneous rocks, contact zones and other metamorphic rocks",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "mindat.org link": "https://www.mindat.org/min-3026.html"
      },
      {
        "Name": "orthopyroxene",
        "Label": "Orthopyroxene",
        "Abbreviation": "opx",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "(Mg,Fe)2Si2O6",
        "Crystal System": "Orthorhombic",
        "Hardness": "5-6",
        "Distinguishing Features": "Euhedral crystals and stubby prisms. Right-angle cleavage.  Brown coloring. Difficult to distinguish from clinopyroxene.",
        "Occurrence": "Mafic and ultramafic igneous rocks and porphyries. Higher iron content orthopyroxene found in diorite, syenite, and granite. Also found in high-grade metamorphic rocks.",
        "Associated Minerals": "Feldspars, clinopyroxene, hornblende, biotite, garnet",
        "mindat.org link": "https://www.mindat.org/min-10967.html"
      },
      {
        "Name": "perovskite",
        "Label": "Perovskite",
        "Abbreviation": "prv",
        "Formula": "CaTiO3",
        "Crystal System": "Orthorhombic",
        "Hardness": "5.5",
        "Distinguishing Features": "Crystals usually cubic. Poor cleavage. Complex twinning occurs in large crystals. Yellow, reddish, brown, or black in color.",
        "Occurrence": "Regional and contact metamorphosed rocks, alkaline basalts.",
        "Associated Minerals": "Chlorite, serpentine. Alteration product of ilmenite.",
        "mindat.org link": "https://www.mindat.org/min-3166.html"
      },
      {
        "Name": "piemontite",
        "Label": "Piemontite",
        "Abbreviation": "pmt",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "Ca2(Al,Mn3+,Fe3+)3O(OH)Si2O7SiO4",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Columnar, bladed, acicular crystals; anhedral grains and aggregates; vitreous luster; red, reddish-brown, reddish-violet, reddish-black",
        "Occurrence": "Greenschist and amphibolite facies metamorphic rocks; low-T hydrothermal veins in volcanic rocks; metasomatized deposits of Mn ore",
        "Associated Minerals": "Quartz, epidote, calcite, spessartine, chloritoid, tremolite, glaucophane, orthoclase",
        "mindat.org link": "https://www.mindat.org/min-3208.html"
      },
      {
        "Name": "plagioclase_fs",
        "Label": "Plagioclase Feldspar",
        "Abbreviation": "pl, plag",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "NaAlSi3O8 - CaAl2Si2O8",
        "Crystal System": "Triclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (nearly 90°), parallel striations, most commonly a grey-white color",
        "Occurrence": "Abundant in igneous rocks. Detrital mineral in sedimentary rocks, but susceptible to weathering. Often occurs in metamorphic rocks as albite. Anorthite found in metamorphosed carbonates, amphibolites. ",
        "Associated Minerals": "Clinopyroxene, orthopyroxene, olivine, quartz, muscovite, biotite",
        "mindat.org link": "https://www.mindat.org/min-3231.html"
      },
      {
        "Name": "pumpellyite",
        "Label": "Pumpellyite",
        "Abbreviation": "pmp",
        "Rock Class": "metamorphic",
        "Formula": "Ca2MgAl2[SiO4][Si2O7](OH)2·H2O",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Green, bluish-green,  brown, greenish-black; distinct {001} cleavage and fair {100} cleavage at 97°",
        "Occurrence": "Glaucophane schist and related low-T, high-P metamorphic rocks; may fill vesicles in metamorphose or hydrothermally altered mafic igenous rocks (basalt); uncommon in skarns and metamorphosed carbonate rocks; detrital grains",
        "Associated Minerals": "Glaucophane, lawsonite, clinozoisite, epidote, chlorite, actinolite, calcite",
        "mindat.org link": "https://www.mindat.org/min-3305.html"
      },
      {
        "Name": "pyrite",
        "Label": "Pyrite",
        "Abbreviation": "py",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "FeS2",
        "Crystal System": "Isometric",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Cubic crystal habit, metallic luster, pale brassy yellow, greenish-black streak. Hardness and lighter yellow color distinguish it from chalcopyrite.",
        "Occurrence": "Hydrothermal sulfide deposits, igneous rocks of nearly any composition. Some metamorphic rocks. Fine grained pyrite in coal and shale.",
        "Associated Minerals": "Other sulfide minerals (galena, sphalerite, molybdenite), quartz, sericite",
        "mindat.org link": "https://www.mindat.org/min-3314.html"
      },
      {
        "Name": "pyrophyllite",
        "Label": "Pyrophyllite",
        "Abbreviation": "prl",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "Al2Si4O10(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "1-2",
        "Distinguishing Features": "Foliated, radiating, columnar, or aggregates of mica-like flakes or fibers. Perfect cleavage, pearly to dull luster, hardness. Inelastic. Difficult to distinguish from talc.",
        "Occurrence": "Low-grade, Al-rich metamorphic rocks, schists.",
        "Associated Minerals": "Sometimes a result of hydrothermal alteration of aluminous minerals. Feldspars, muscovite, alminimum silicates, corundum, topaz.",
        "mindat.org link": "https://www.mindat.org/min-3323.html"
      },
      {
        "Name": "pyrrhotite",
        "Label": "Pyrrhotite",
        "Abbreviation": "po",
        "Formula": "Fe7S8",
        "Crystal System": "Monoclinic ",
        "Hardness": "3.5-4.5",
        "Distinguishing Features": "Often crystallizes as hexagonal plates. Simple or repeated twinning. No cleavage, uneven to subconchoidal fracture. Metallic luster. Bronze-yellow color (darker than pyrite) with red-brown cast. Easily tarnished and exhibits iridescence. Dark, grey-black streak. Magnetic, but highly variable in intensity.",
        "Occurrence": "High temperature hydrothermal sulfide deposits, mafic and ultramafic igneous rocks, pegmatites, contact metamorphosed deposits. Can form as a biomineral. Troilite (FeS), a related, non-magnetic mineral, is found in meteorites. ",
        "Associated Minerals": "Pyrite, marcasite, chalcopyrite, magnetite, galena, other sulfides.",
        "mindat.org link": "https://www.mindat.org/min-3328.html"
      },
      {
        "Name": "quartz",
        "Label": "Quartz",
        "Abbreviation": "qz",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "SiO2",
        "Crystal System": "Hexagonal",
        "Hardness": "7",
        "Distinguishing Features": "Hardness, conchoidal fracture, vitreous luster, distinct crystals. Beryl is often blue or green, and opal is softer. ",
        "Occurrence": "Most igneous, metamorphic, and sedimentary rocks.",
        "Associated Minerals": "Huge variety. Uncommon in low silica environments.",
        "mindat.org link": "https://www.mindat.org/min-3337.html"
      },
      {
        "Name": "rutile",
        "Label": "Rutile",
        "Abbreviation": "rt",
        "Rock Class": "metamorphic",
        "Formula": "TiO2",
        "Crystal System": "Tetragonal",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Adamantine or metallic luster. Red-brown color. Crystals may form as striated prisms or finely fibrous crystals.",
        "Occurrence": "Usually fine-grained and difficult to idenitfy, but often occurs as an accessory mineral in metamorphic and igneous rocks (granite, gneiss, mica schist, syenitic rocks, amphibolites). Sometimes granular limestone and dolomite.",
        "Associated Minerals": "Quartz, calcite, topaz, sphalerite. Alters to ilmenite.",
        "mindat.org link": "https://www.mindat.org/min-3486.html"
      },
      {
        "Name": "sanidine",
        "Label": "Sanidine",
        "Abbreviation": "sa",
        "Rock Class": "volcanic",
        "Formula": "(K, Na)AlSi3O8",
        "Crystal System": "Monoclinic",
        "Hardness": "6-6.5",
        "Distinguishing Features": "Good cleavage (90°), common as phenocrysts. Colorless to white, vitreous luster, carlsbad twinning. Alters to sericite and clay.",
        "Occurrence": "Silicic volcanic rocks (e.g. rhyolite, trachyte). High temperature.",
        "Associated Minerals": "Quartz, muscovite, biotite",
        "mindat.org link": "https://www.mindat.org/min-3521.html"
      },
      {
        "Name": "sapphirine",
        "Label": "Sapphirine",
        "Abbreviation": "spr",
        "Rock Class": "metamorphic",
        "Formula": "Mg4(Mg3Al9)O4(Si3Al9O36)",
        "Crystal System": "Monoclinic",
        "Hardness": "7.5",
        "Distinguishing Features": "Strongly resembles blue corundum, but softer. Tabular crystal habit, light to dark blue (occasionally green, white, red or yellow). Often occurs as disseminated grains.",
        "Occurrence": "Aluminous metamorphic rocks (mica schists and gneisses)",
        "Associated Minerals": "Spinel, sillimanite, pale green hornblende, cordierite, anorthite",
        "mindat.org link": "https://www.mindat.org/min-3531.html"
      },
      {
        "Name": "serpentine",
        "Label": "Serpentine",
        "Abbreviation": "srp",
        "Rock Class": "metamorphic",
        "Formula": "Mg3Si2O5(OH)4",
        "Crystal System": "Monoclinic",
        "Hardness": "2.5-3.5",
        "Distinguishing Features": "Greasy or waxy luster (chrysotile is silky), usually shades of green (although susceptible to magnetite staining). Fibrous or fine-grained masses. Conchoidal or splintery fracture.",
        "Occurrence": "Hydrothermally altered mafic and ultramafic rocks. Serpentinite, peridotite, pyroxenite. ",
        "Associated Minerals": "Magnetite, talc, calcite, brucite, chlorite, chromite, olivine, pyroxenes, amphiboles",
        "mindat.org link": "https://www.mindat.org/min-11135.html"
      },
      {
        "Name": "sillimanite",
        "Label": "Sillimanite",
        "Abbreviation": "sil",
        "Rock Class": "metamorphic",
        "Formula": "Al2SiO5",
        "Crystal System": "Orthorhombic",
        "Hardness": "6.5-7.5",
        "Distinguishing Features": "Fibrous crystal habit, may form swirled or matted aggregates. Satiny luster. Sometimes partially replaced by muscovite. Only one plane of cleavage.",
        "Occurrence": "Medium pressure, high temperature metamorphic rocks. Mica schists and gneisses. ",
        "Associated Minerals": "Muscovite, corundum, often intergrown with andalusite",
        "mindat.org link": "https://www.mindat.org/min-3662.html"
      },
      {
        "Name": "sphalerite",
        "Label": "Sphalerite",
        "Abbreviation": "sp",
        "Formula": "ZnS",
        "Crystal System": "Isometric",
        "Hardness": "3.5-4",
        "Distinguishing Features": "Tetrahedral crystals with triangular markings on faces; also cubes and dodecahedrons, cleavable masses, encrusting aggregates. Conchoidal fracture. Resinous, adamantine, or submetallic luster. Pale yellow, honey brown, black, red, green, or white color, with a white to light brown streak. Often confused with galena, but distinguished by streak. Twinning common.",
        "Occurrence": "Hydrothermal sulfide deposits. Also an accessory mineral in felsic igneous rocks and coal beds. Can also be biologically precipitated.",
        "Associated Minerals": "Galena, pyrite, chalcopyrite, pyrrhotite, calcite, fluorite, barite, quartz, carbonates, sulfates",
        "mindat.org link": "https://www.mindat.org/min-3727.html"
      },
      {
        "Name": "spinel",
        "Label": "Spinel",
        "Abbreviation": "spl",
        "Rock Class": "plutonic, metamorphic",
        "Formula": "MgAl2O4",
        "Crystal System": "Isometric",
        "Hardness": "7.5-8",
        "Distinguishing Features": "Octahedral or cubic crystal habit, hardness, often green or blue-green, but can be colorless. Conchoidal fracture. ",
        "Occurrence": "Aluminous metamorphic rocks, contact or regionally metamorphosed limestone and dolostone, ultramafic rocks. Occasionally granitic pegmatites and hydrothermal veins.",
        "Associated Minerals": "Andalusite, kyanite, sillimanite, cordierite, corundum, magnetite, calcite",
        "mindat.org link": "https://www.mindat.org/min-3729.html"
      },
      {
        "Name": "spodumene",
        "Label": "Spodumene",
        "Abbreviation": "spd",
        "Formula": "LiAlSi2O6",
        "Crystal System": "Monoclinic",
        "Hardness": "6.5-7",
        "Distinguishing Features": "Prismatic, octagonal, often vertically striated crystals (also acicular and cleavable masses). Perfect pyroxene (~90°) cleavage. Vitreous luster. Color is white, greyish-white, pale shades of blue, green, or yellow. Exhibits splintery fracture.",
        "Occurrence": "Li-bearing pegmatites.",
        "Associated Minerals": "Quartz, K-feldspar, plagioclase, tourmaline, beryl, lepidolite, spessartine, aquamarine. May alter to albite and eucryptite.",
        "mindat.org link": "https://www.mindat.org/min-3733.html"
      },
      {
        "Name": "staurolite",
        "Label": "Staurolite",
        "Abbreviation": "st",
        "Rock Class": "metamorphic",
        "Formula": "Fe2Al9O6((Si,Al)O4)4(OH)2",
        "Crystal System": "Monoclinic ",
        "Hardness": "7-7.5",
        "Distinguishing Features": "Cross-shaped twins, elongate, prismatic crystal habit with pinacoids, poor cleavage, brown color, vitreous luster",
        "Occurrence": "Medium-grade pelitic metamorphic rocks (schists).",
        "Associated Minerals": "Garnet, sillimanite, kyanite, tourmaline, cordierite, chloritoid, aluminum silicates, muscovite, biotite",
        "mindat.org link": "https://www.mindat.org/min-3753.html"
      },
      {
        "Name": "talc",
        "Label": "Talc",
        "Abbreviation": "tlc",
        "Rock Class": "metamorphic",
        "Formula": "Mg3Si4O10(OH)2",
        "Crystal System": "Triclinic",
        "Hardness": "1",
        "Distinguishing Features": "Waxy feel, pearly or greasy luster, aggregates of irregular flakes and fibers, perfect, micaceous cleavage. Hardness, soapy feel. Often fine-grained and massive (\"soapstone\" form)",
        "Occurrence": "Hydrothermally altered mafic and ultramafic rocks. Metamorphism of dolomite.  Schists.",
        "Associated Minerals": "Serpentine, magnesite, olivine, tourmaline, pyroxene or calcite, dolomite, tremolite",
        "mindat.org link": "https://www.mindat.org/min-3875.html"
      },
      {
        "Name": "titanite",
        "Label": "Titanite",
        "Abbreviation": "ttn",
        "Rock Class": "plutonic, volcanic, metamorphic",
        "Formula": "CaTiSiO5",
        "Crystal System": "Monoclinic",
        "Hardness": "5-5.5",
        "Distinguishing Features": "Wedge-shaped crystals, resinous luster, often a honey-brown color",
        "Occurrence": "Accessory mineral in many igneous rocks or mafic metamorphic rocks (hornblende granites, syenites, diorites, schists, gneisses). Also a heavy mineral in clastic sedimentary rocks.",
        "Associated Minerals": "Pyroxene, amphibole, chlorite, scapolite, zircon, apatite, quartz",
        "mindat.org link": "https://www.mindat.org/min-3977.html"
      },
      {
        "Name": "topaz",
        "Label": "Topaz",
        "Abbreviation": "tpz, toz",
        "Formula": "Al2SiO4(F,OH)2",
        "Crystal System": "Orthorhombic",
        "Hardness": "8",
        "Distinguishing Features": "Stubby or elongate prisms parallel to c axis; perfect basal cleavage on {001}; subconchoidal to uneven fracture; high specific gravity",
        "Occurrence": "Volcanic and intrusive felsic igneous rocks; may fill vesicles/cavities in rhyolitic volcanics; large masses in granitic pegmatite; hydrothermal tungsten, tin, molybdenum, gold deposits; hydrothermally altered rocks near granite intrusions; uncommon in quartzite and schist; occurs as heavy minerals in sediments",
        "Associated Minerals": "Quartz, albite, muscovite, fluorite, schorl, microcline",
        "mindat.org link": "https://www.mindat.org/min-3996.html"
      },
      {
        "Name": "tourmaline",
        "Label": "Tourmaline",
        "Abbreviation": "tur",
        "Rock Class": "plutonic",
        "Formula": "(Ca,Na,K)(Mg, Fe, Li, Al,Mn)3(Al,Cr,Fe,V)6Si6O18(BO3)3(O,OH)3(F,O,OH)",
        "Crystal System": "Hexagonal",
        "Hardness": "7",
        "Distinguishing Features": "Columnar, prismatic crystal habit, rounded triangular cross sections, often vertically striated. Vitreous to resinous luster. Conchoidal fracture. ",
        "Occurrence": "Granitic pegmatites, felsic igneous rocks, rocks hydrothermally altered adjacent to pegmatitic or felsic intrusive rocks. Accessory in schist, gneiss, quartzite, phyllite, contact metamorphic zones. Resistant to weathering, therefore often found as clasts.",
        "Associated Minerals": "Muscovite, biotite, quartz, feldspars, beryl",
        "mindat.org link": "https://www.mindat.org/min-4003.html"
      },
      {
        "Name": "tremolite",
        "Label": "Tremolite",
        "Abbreviation": "tr",
        "Rock Class": "metamorphic",
        "Formula": "Ca2Mg5Si8O22(OH)2",
        "Crystal System": "Monoclinic",
        "Hardness": "5-6",
        "Distinguishing Features": "Cleavage, hardness, columnar or bladed crystal habit, white or dark grey to light green color. Often forms as compact masses of slender crystals.",
        "Occurrence": "Moderately high temperature and pressure conditions in the presence of water. Metamorphosed limestones or dolostones, gneisses and schist with serpentines, granites. Mafic and ultramafic igneous rocks, metagraywacke, blueschist. ",
        "Associated Minerals": "Calcite, dolomite, forsterite, garnet, diopside, wollastonite, talc, epidote, chlorite",
        "mindat.org link": "https://www.mindat.org/min-4011.html"
      },
      {
        "Name": "vesuvianite",
        "Label": "Vesuvianite",
        "Abbreviation": "ves",
        "Rock Class": "metamorphic",
        "Formula": "(Ca,Na)19(Al,Mg,Fe3+)13(B,Al,Fe)5(Si2O7)4(SiO4)10(OH,F,O)10",
        "Crystal System": "Tetragonal",
        "Hardness": "6-7",
        "Distinguishing Features": "Stubby prismatic or pyramidal crystal habit. Can also be massive or form in columnar or radial patterns. Yellow, green, or brown in color. Vitreous luster, poor cleavage. Often resembles garnet, tourmaline, or epidote.",
        "Occurrence": "Contact-metamorphosed limestone, altered mafic rocks, nepheline syenite, schists, gneiss, amphibolite. Rarely occurs in pegmatite.",
        "Associated Minerals": "Grossular, phlogopite, diopside, wollastonite, epidote, serpentine, chlorite",
        "mindat.org link": "https://www.mindat.org/min-4223.html"
      },
      {
        "Name": "wollastonite",
        "Label": "Wollastonite",
        "Abbreviation": "wo",
        "Rock Class": "metamorphic",
        "Formula": "CaSiO3",
        "Crystal System": "Triclinic",
        "Hardness": "4.5-5",
        "Distinguishing Features": "White, gray, or pale green. Splintery fracture. Good to perfect cleavage distinguishes it from tremolite. ",
        "Occurrence": "Metamorphosed limestone and dolomite. Occasionally alkalic igneous rocks.",
        "Associated Minerals": "Calcite, dolomite, tremolite, epidote, grossular, diospide, garnet, Ca-Mg silicates.",
        "mindat.org link": "https://www.mindat.org/min-4323.html"
      },
      {
        "Name": "xenotime",
        "Label": "Xenotime",
        "Abbreviation": "xtm",
        "Formula": "YPO4",
        "Crystal System": "Tetragonal",
        "Hardness": "4-5",
        "Distinguishing Features": "Elongate prismatic crystals (similar to zircon). Uneven to splintery fracture. Vitreous to resinous luster. Usually a yellowish to reddish brown color (sometimes pale yellow, grey, salmon pink, or green). Streak is pale brown, yellowish, or reddish. Softer than zircon and has good cleavage at right angles. Produces pleochroic haloes in surrounding minerals.",
        "Occurrence": "Accessory in granite, granodiorite, syenite, granitic pegmatite, mica schists, gneiss. Less commonly found in marble. Detrital grain and heavy component of clastic rocks.",
        "Associated Minerals": "Quartz, K-feldspar, pyroxenes, biotite, muscovite, zircon",
        "mindat.org link": "https://www.mindat.org/min-6613.html"
      },
      {
        "Name": "zeolite",
        "Label": "Zeolite",
        "Abbreviation": "zeo",
        "Rock Class": "metamorphic, alteration_ore",
        "Formula": "Group of hydrated silicates",
        "Crystal System": "Variable",
        "Hardness": "Variable",
        "Distinguishing Features": "Often too fine-grained for idenitification by hand sample. When found as large enough crystals, usually white to colorless (sometimes shades of yellow, pink, brown, or green). Soft, white streak, vitreous luster.",
        "Occurrence": "Encompasses a large group of hydrated framework silicates that often form as secondary minerals. Occupies vesicles in basalts and andesites, sedimentary and metamorphic rocks, hydrothermally altered volcanics. Analcime can occur as a primary magmatic mineral.",
        "Associated Minerals": "Prehnite, apophyllite, datolite, pectolite, pyroxenes, plagioclase,  olivine, quartz, feldspars, nephelite, leucite, sodalite, calcite",
        "mindat.org link": "https://www.mindat.org/min-4395.html"
      },
      {
        "Name": "zircon",
        "Label": "Zircon",
        "Abbreviation": "zrn",
        "Rock Class": "plutonic",
        "Formula": "ZrSiO4",
        "Crystal System": "Tetragonal",
        "Hardness": "6.5-7.5",
        "Distinguishing Features": "Often microscopic prisms, elongate on the c-axis and capped by dipyramids. Adamantine luster, conchoidal fracture. Rarely seen in hand sample.  When enclosed by other minerals (e.g. micas, andalusite, amphiboles, pyroxenes), often bordered by pleochroic haloes.",
        "Occurrence": "Resistant to weathering and often endures the entirety of the rock cycle. Especially common in granite, nepheline syenite, diorite.",
        "Associated Minerals": "Huge variety of associated minerals. ",
        "mindat.org link": "https://www.mindat.org/min-4421.html"
      },
      {
        "Name": "zoisite",
        "Label": "Zoisite",
        "Abbreviation": "zo",
        "Rock Class": "metamorphic",
        "Formula": "Ca2Al3OOH(Si2O7)(SiO4)",
        "Crystal System": "Orthorhombic",
        "Hardness": "6-7",
        "Distinguishing Features": "Most often forms as anhedral grains and granular aggregates, but well-formed crystals are columnar, prismatic, or acicular with vertical striations. Single, perfect cleavage, vitreous luster (pearly on cleavage face). White, grey, greenish brown, greenish grey, or pink color. Similar to epidote and clinozoisite, but less green. ",
        "Occurrence": "Medium-grade metapelites rich in Ca (calcareous shale, sandstone, or limestone). Less commonly occurs in blueschists, eclogite, quartz veins, pegmatites, ore deposits. Often embedded in quartz or sulfides.",
        "Associated Minerals": "Quartz, amphiboles (actinolite, glaucophane), plagioclase, chlorite, corundum",
        "mindat.org link": "https://www.mindat.org/min-4430.html"
      }
    ];
    var mineralsByClass = []

    activate();

    return {
      'getAbbrevFromFullMineralName': getAbbrevFromFullMineralName,
      'getFullMineralNameFromAbbrev': getFullMineralNameFromAbbrev,
      'getMineralAbbreviations': getMineralAbbreviations,
      'getMineralGlossary': getMineralGlossary,
      'getMineralInfo': getMineralInfo,
      'getMineralsByClass': getMineralsByClass
    };

    /**
     * Private Functions
     */

    function activate() {
      createAbbreviationsLists();
    }

    // Create a list of abbreviations with corresponding name and a list of names with corresponding abbreviations
    function createAbbreviationsLists() {
      _.each(mineralGlossaryInfo, function (mineral) {
        if (mineral.Abbreviation) {
          _.each(mineral.Abbreviation.split(', '), function (abb) {
            abbreviationsWithLabels[abb] = mineral.Label;
          });
          labelsWithAbberviations[mineral.Label] = mineral.Abbreviation;
        }
        if (mineral["Rock Class"]) {
          _.each(mineral["Rock Class"].split(', '), function (rockClass) {
            if (!mineralsByClass[rockClass]) mineralsByClass[rockClass] = [];
            mineralsByClass[rockClass].push(mineral);
          });
        }
      });
    }

    /**
     * Public Functions
     */

    function getAbbrevFromFullMineralName(name) {
      return _.findKey(abbreviationsWithLabels, function (value) {
        return value.toLowerCase() === name.toLowerCase();
      })
    }

    function getFullMineralNameFromAbbrev(abbrev) {
      return abbreviationsWithLabels[abbrev.toLowerCase()];
    }

    function getMineralAbbreviations() {
      return _.map(labelsWithAbberviations, function (value, key) {
        return key + ': ' + value;
      });
    }

    function getMineralGlossary() {
      return mineralGlossaryInfo;
    }

    function getMineralInfo(name) {
      return _.find(mineralGlossaryInfo, function (mineralDescription) {
        return mineralDescription.Name === name;
      });
    }

    function getMineralsByClass() {
      return mineralsByClass;
    }
  }
}());
