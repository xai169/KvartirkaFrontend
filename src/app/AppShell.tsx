import { ActionIcon, Container, Group, Text, ThemeIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconHome, IconMoon, IconPigMoney, IconShoppingBag, IconSun, IconUser } from "@tabler/icons-react";
import { Link, Outlet } from "@tanstack/react-router";
import classes from "./AppShell.module.css";

const navigation = [
    { to: "/", label: "Накопления", icon: IconPigMoney },
    { to: "/purchases", label: "Покупки", icon: IconShoppingBag },
    { to: "/profile", label: "Профиль", icon: IconUser },
] as const;

export function AppShell() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const themeLabel = colorScheme === "dark" ? "Светлая тема" : "Тёмная тема";
    return (
        <div className={classes.shell}>
            <a
                href="#main-content"
                className={classes.skipLink}
            >
                К содержимому
            </a>
            <header className={classes.header}>
                <Container size="lg">
                    <Group
                        justify="space-between"
                        h={72}
                        wrap="nowrap"
                    >
                        <Link
                            to="/"
                            className={classes.brand}
                        >
                            <ThemeIcon
                                size={36}
                                radius="md"
                            >
                                <IconHome size={22} />
                            </ThemeIcon>
                            <Text
                                fw={750}
                                size="xl"
                            >
                                Квартирка
                            </Text>
                        </Link>
                        <nav
                            className={classes.desktopNav}
                            aria-label="Основная навигация"
                        >
                            {navigation.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    activeOptions={{ exact: to === "/" }}
                                    className={classes.navLink}
                                >
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>
                        <Tooltip label={themeLabel}>
                            <ActionIcon
                                size="lg"
                                variant="default"
                                aria-label={themeLabel}
                                onClick={() => setColorScheme(colorScheme === "dark" ? "light" : "dark")}
                            >
                                {colorScheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Container>
            </header>
            <Container
                component="main"
                id="main-content"
                tabIndex={-1}
                size="lg"
                className={classes.main}
            >
                <Outlet />
            </Container>
            <nav
                className={classes.mobileNav}
                aria-label="Мобильная навигация"
            >
                {navigation.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        activeOptions={{ exact: to === "/" }}
                        className={classes.navLink}
                    >
                        <Icon size={22} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
