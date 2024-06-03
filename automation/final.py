from collections import OrderedDict
from pathlib import Path

import numpy as np
import pandas as pd
import pylogit as pl
from constants import PIRATE_NAMES

df = pd.read_csv("./output/history.csv")


# combine columns pirate1 through pirate4 into a single column containing a list of pirate choices
def convert_df(df_orig: pd.DataFrame) -> pd.DataFrame:
    df = df_orig.copy()
    df["pirates"] = df[["pirate1", "pirate2", "pirate3", "pirate4"]].values.tolist()
    df["fas"] = df[["fa1", "fa2", "fa3", "fa4"]].values.tolist()
    df["pfas"] = df[["pfa1", "pfa2", "pfa3", "pfa4"]].values.tolist()
    df["nfas"] = df[["nfa1", "nfa2", "nfa3", "nfa4"]].values.tolist()
    df["opening_odds"] = df[
        ["opening_odds1", "opening_odds2", "opening_odds3", "opening_odds4"]
    ].values.tolist()
    df["closing_odds"] = df[
        ["closing_odds1", "closing_odds2", "closing_odds3", "closing_odds4"]
    ].values.tolist()
    df = df.drop(["pirate1", "pirate2", "pirate3", "pirate4"], axis=1)
    df = df.drop(["fa1", "fa2", "fa3", "fa4"], axis=1)
    df = df.drop(["pfa1", "pfa2", "pfa3", "pfa4"], axis=1)
    df = df.drop(["nfa1", "nfa2", "nfa3", "nfa4"], axis=1)
    df = df.drop(
        ["opening_odds1", "opening_odds2", "opening_odds3", "opening_odds4"],
        axis=1,
    )
    df = df.drop(
        ["closing_odds1", "closing_odds2", "closing_odds3", "closing_odds4"],
        axis=1,
    )
    df["match_id"] = df["round"] * 5 + df["arena"]
    return df


df = convert_df(df)


# explode each row of df into four rows, so that the resulting df
# contains columns of round, arena, win (0 or 1), pirate, fa, opening_odds, closing_odds, match_id
def convert_to_long_format_with_win(df: pd.DataFrame):
    long_format_columns = [
        "round",
        "arena",
        "win",
        "pirate",
        "fa",
        "pfa",
        "nfa",
        "position",
        "position_factor",
        "is_pos1",
        "is_pos2",
        "is_pos3",
        "is_pos4",
        "opening_odds",
        "closing_odds",
        "match_id",
    ]
    # positional effect is significant but sorta non-linear; this is taken from a model data
    # and we'll calculate each pirates "suscetibility to positional effects" by fitting a multiplier
    position_factor = [-0.1856, 0.0, 0.2848, 0.5554]
    long_format = pd.DataFrame(
        [
            (
                tup.round,
                tup.arena,
                1 if "winner" in df.columns and tup.winner == (i + 1) else 0,
                tup.pirates[i],
                tup.fas[i],
                tup.pfas[i],
                tup.nfas[i],
                i + 1,
                position_factor[i],
                1 if i + 1 == 1 else 0,
                1 if i + 1 == 2 else 0,
                1 if i + 1 == 3 else 0,
                1 if i + 1 == 4 else 0,
                tup.opening_odds[i],
                tup.closing_odds[i],
                tup.match_id,
            )
            for tup in df.itertuples()
            for i in range(4)
        ],
        columns=long_format_columns,
    )
    long_format["log_opening_implied_winrate"] = np.log(
        1.0 / long_format["opening_odds"],
    )
    return long_format


long_format = convert_to_long_format_with_win(df)

pirates_including_the_first = list(range(1, 21))
pirates_except_the_first = list(range(2, 21))

per_pirate_fa_and_per_pirate_pos_specification = OrderedDict()
per_pirate_fa_and_per_pirate_pos_names = OrderedDict()
pirates_except_goob = [i for i in range(1, 21) if i != 15]
per_pirate_fa_and_per_pirate_pos_specification["intercept"] = pirates_except_goob
per_pirate_fa_and_per_pirate_pos_names["intercept"] = [
    f"ASC_{i}_{PIRATE_NAMES[i]}" for i in pirates_except_goob
]
per_pirate_fa_and_per_pirate_pos_specification["pfa"] = pirates_including_the_first
per_pirate_fa_and_per_pirate_pos_names["pfa"] = [
    f"PFA_{i}_{PIRATE_NAMES[i]}" for i in pirates_including_the_first
]
per_pirate_fa_and_per_pirate_pos_specification["nfa"] = pirates_including_the_first
per_pirate_fa_and_per_pirate_pos_names["nfa"] = [
    f"NFA_{i}_{PIRATE_NAMES[i]}" for i in pirates_including_the_first
]
per_pirate_fa_and_per_pirate_pos_specification["is_pos2"] = pirates_including_the_first
per_pirate_fa_and_per_pirate_pos_names["is_pos2"] = [
    f"is_pos2_{i}_{PIRATE_NAMES[i]}" for i in pirates_including_the_first
]
per_pirate_fa_and_per_pirate_pos_specification["is_pos3"] = pirates_including_the_first
per_pirate_fa_and_per_pirate_pos_names["is_pos3"] = [
    f"is_pos3_{i}_{PIRATE_NAMES[i]}" for i in pirates_including_the_first
]
per_pirate_fa_and_per_pirate_pos_specification["is_pos4"] = pirates_including_the_first
per_pirate_fa_and_per_pirate_pos_names["is_pos4"] = [
    f"is_pos4_{i}_{PIRATE_NAMES[i]}" for i in pirates_including_the_first
]

per_pirate_fa_and_per_pirate_pos_mnl = pl.create_choice_model(
    data=long_format,
    alt_id_col="pirate",
    obs_id_col="match_id",
    choice_col="win",
    specification=per_pirate_fa_and_per_pirate_pos_specification,
    model_type="MNL",
    names=per_pirate_fa_and_per_pirate_pos_names,
)
per_pirate_fa_and_per_pirate_pos_mnl.fit_mle(np.zeros(119))
per_pirate_fa_and_per_pirate_pos_mnl.get_statsmodels_summary()


def generate_javascript(params) -> str:
    sep = ",\n    "
    return f"""
export const LOGIT_INTERCEPTS = {{
    {sep.join([f"{i + 1}: {params.iloc[i]}" for i in range(14)])}{sep}15: 0.0{sep}{sep.join([f"{i + 2}: {params.iloc[i]}" for i in range(14, 19)])},
}};
export const LOGIT_PFA = {{
    {sep.join([f"{i - 18}: {params.iloc[i]}" for i in range(19, 39)])},
}};
export const LOGIT_NFA = {{
    {sep.join([f"{i - 38}: {params.iloc[i]}" for i in range(39, 59)])},
}};
export const LOGIT_IS_POS2 = {{
    {sep.join([f"{i - 58}: {params.iloc[i]}" for i in range(59, 79)])},
}};
export const LOGIT_IS_POS3 = {{
    {sep.join([f"{i - 78}: {params.iloc[i]}" for i in range(79, 99)])},
}};
export const LOGIT_IS_POS4 = {{
    {sep.join([f"{i - 98}: {params.iloc[i]}" for i in range(99, 119)])},
}};
""".strip()


def generate_python(params) -> str:
    sep = ",\n    "
    return f"""
LOGIT_INTERCEPTS = [
    {sep.join([f"{params.iloc[i]}" for i in range(14)])}{sep}0.0{sep}{sep.join([f"{params.iloc[i]}" for i in range(14, 19)])},
]
LOGIT_PFA = [
    {sep.join([f"{params.iloc[i]}" for i in range(19, 39)])},
]
LOGIT_NFA = [
    {sep.join([f"{params.iloc[i]}" for i in range(39, 59)])},
]
LOGIT_IS_POS2 = [
    {sep.join([f"{params.iloc[i]}" for i in range(59, 79)])},
]
LOGIT_IS_POS3 = [
    {sep.join([f"{params.iloc[i]}" for i in range(79, 99)])},
]
LOGIT_IS_POS4 = [
    {sep.join([f"{params.iloc[i]}" for i in range(99, 119)])},
]
""".strip()


def generate_rust(params) -> str:
    sep = ",\n    "
    return f"""
static LOGIT_INTERCEPTS: [f64; 20] = [
    {sep.join([f"{params.iloc[i]}" for i in range(14)])}{sep}0.0{sep}{sep.join([f"{params.iloc[i]}" for i in range(14, 19)])},
];
static LOGIT_PFA: [f64; 20] = [
    {sep.join([f"{params.iloc[i]}" for i in range(19, 39)])},
];
static LOGIT_NFA: [f64; 20] = [
    {sep.join([f"{params.iloc[i]}" for i in range(39, 59)])},
];
static LOGIT_IS_POS2: [f64; 20] = [
    {sep.join([f"{params.iloc[i]}" for i in range(59, 79)])},
];
static LOGIT_IS_POS3: [f64; 20] = [
    {sep.join([f"{params.iloc[i]}" for i in range(79, 99)])},
];
static LOGIT_IS_POS4: [f64; 20] = [
    {sep.join([f"{params.iloc[i]}" for i in range(99, 119)])},
];
""".strip()


print("Writing output files...")
print("Creating javascript.js...")
Path("./output/javascript.js").write_text(
    generate_javascript(per_pirate_fa_and_per_pirate_pos_mnl.params),
)
print("Creating rust.rs...")
Path("./output/rust.rs").write_text(
    generate_rust(per_pirate_fa_and_per_pirate_pos_mnl.params),
)
print("Creating python.py...")
Path("./output/python.py").write_text(
    generate_python(per_pirate_fa_and_per_pirate_pos_mnl.params),
)
