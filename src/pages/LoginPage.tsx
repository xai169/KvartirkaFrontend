import {
    Alert,
    Button,
    Center,
    Container,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/features/auth/api/authApi";
import { ApiError, errorMessage } from "@/shared/api/apiError";
import classes from "./LoginPage.module.css";

const routeApi = getRouteApi("/login");
export function LoginPage() {
    const { redirect } = routeApi.useSearch();
    const [loginValue, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const mutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            window.location.replace(redirect);
        },
    });
    return (
        <Center className={classes.page}>
            <Container
                size={420}
                w="100%"
            >
                <Stack
                    align="center"
                    mb="xl"
                    gap="sm"
                >
                    <ThemeIcon
                        size={56}
                        radius="xl"
                    >
                        <IconHome size={30} />
                    </ThemeIcon>
                    <Title
                        order={1}
                        size="h2"
                    >
                        Квартирка
                    </Title>
                    <Text
                        c="dimmed"
                        ta="center"
                    >
                        Большие планы для вашего дома
                    </Text>
                </Stack>
                <Paper
                    withBorder
                    p="xl"
                    radius="lg"
                    shadow="xs"
                >
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!mutation.isPending) mutation.mutate({ login: loginValue.trim(), password });
                        }}
                    >
                        <Stack>
                            <Title
                                order={2}
                                size="h3"
                            >
                                Добро пожаловать
                            </Title>
                            <Text
                                size="sm"
                                c="dimmed"
                            >
                                Войдите, чтобы продолжить копить и планировать покупки вместе.
                            </Text>
                            <TextInput
                                label="Логин"
                                autoComplete="username"
                                required
                                maxLength={100}
                                value={loginValue}
                                onChange={(event) => setLogin(event.currentTarget.value)}
                                disabled={mutation.isPending}
                            />
                            <PasswordInput
                                label="Пароль"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.currentTarget.value)}
                                disabled={mutation.isPending}
                            />
                            {mutation.error && (
                                <Alert
                                    color="red"
                                    role="alert"
                                >
                                    {mutation.error instanceof ApiError && mutation.error.status === 401
                                        ? "Неверный логин или пароль"
                                        : errorMessage(mutation.error)}
                                </Alert>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                loading={mutation.isPending}
                                mt="xs"
                            >
                                Войти
                            </Button>
                        </Stack>
                    </form>
                </Paper>
                <Text
                    size="xs"
                    ta="center"
                    c="dimmed"
                    mt="lg"
                >
                    Ваш общий дом начинается с маленьких шагов.
                </Text>
            </Container>
        </Center>
    );
}
