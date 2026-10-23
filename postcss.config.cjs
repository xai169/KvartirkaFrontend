module.exports = {
    plugins: {
        "postcss-preset-mantine": {},
        "postcss-simple-vars": {
            // Значения соответствуют стандартным breakpoints Mantine.
            // При создании custom theme их нужно изменять синхронно с theme.breakpoints.
            variables: {
                "mantine-breakpoint-xs": "36em",
                "mantine-breakpoint-sm": "48em",
                "mantine-breakpoint-md": "62em",
                "mantine-breakpoint-lg": "75em",
                "mantine-breakpoint-xl": "88em",
            },
        },
    },
};
