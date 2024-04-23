const tracks: {
    [key: string]: {
        name: string;
        dlc?: string;
        image?: string;
    };
} = {
    // todo: match legacy naming to current spec, see: https://www.acc-wiki.info/wiki/Racetracks_Overview
    barcelona: {
        name: "Barcelona Grand Prix Circuit",
        image: "track-Barcelona",
    },
    mount_panorama: {
        name: "Bathurst - Mount Panorama Circuit",
        dlc: "icgt",
        image: "int_gt_pack-18",
    },
    brands_hatch: {
        name: "Brands Hatch",
        image: "track-Brands-Hatch",
    },
    donington: {
        name: "Donington Park",
        dlc: "bgt",
        image: "9-2",
    },
    hungaroring: {
        name: "Hungaroring",
    },
    imola: {
        name: "Imola",
        dlc: "gtwc",
        image: "track-imola",
    },
    kyalami: {
        name: "Kyalami",
        dlc: "icgt",
    },
    valencia: {
        name: "Valencia",
        dlc: "GTWC-2023",
    },
    laguna_seca: {
        name: "Laguna Seca",
        dlc: "icgt",
        image: "int_gt_pack-2",
    },
    misano: {
        name: "Misano",
    },
    monza: {
        name: "Monza",
    },
    nurburgring: {
        name: "Nurburgring",
    },
    oulton_park: {
        name: "Oulton Park",
        dlc: "bgt",
        image: "12-3",
    },
    paul_ricard: {
        name: "Paul Ricard",
        image: "track-Paul-Ricard",
    },
    silverstone: {
        name: "Silverstone",
    },
    snetterton: {
        name: "Snetterton 300",
        dlc: "bgt",
    },
    spa: {
        name: "Spa-Francorchamps",
    },
    suzuka: {
        name: "Suzuka",
        dlc: "icgt",
        image: "int_gt_pack-3",
    },
    zandvoort: {
        name: "Zandvoort",
    },
    zolder: {
        name: "Zolder",
    },
    watkins_glen: {
        name: "Watkins Glen",
        dlc: "atp",
        image: "9-2-3",
    },
    cota: {
        name: "Circuit of the Americas",
        dlc: "atp",
        image: "3-3",
    },
    indianapolis: {
        name: "Indianapolis Motor Speedway",
        dlc: "atp",
        image: "jp",
    },
    nurburgring_24h: {
        name: "Nurburgring 24h",
        dlc: "nurb-24",
    },
    red_bull_ring: {
        name: "Red Bull Ring",
        dlc: "gt2",
    },
};

const staticData = {tracks};

export default staticData;