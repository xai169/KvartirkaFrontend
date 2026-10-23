import {
    Avatar,
    Button,
    Group,
    Paper,
    SegmentedControl,
    Stack,
    Text,
    Title,
    useMantineColorScheme,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUserOptions, logout } from "@/features/auth/api/authApi";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ErrorState, FormError, LoadingState } from "@/shared/ui/ResourceState";

export function ProfilePage() {
    const user = useQuery(currentUserOptions);
    const queryClient = useQueryClient();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const mutation = useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            window.location.replace("/login");
        },
    });
    return (
        <>
            <PageHeader
                title="Профиль"
                description="Ваш аккаунт и настройки"
            />
            {user.isPending ? (
                <LoadingState />
            ) : user.error ? (
                <ErrorState
                    error={user.error}
                    onRetry={() => void user.refetch()}
                />
            ) : (
                <Stack
                    gap="lg"
                    maw={640}
                >
                    <Paper
                        withBorder
                        p="xl"
                        radius="lg"
                    >
                        <Group
                            align="flex-start"
                            wrap="nowrap"
                        >
                            <Avatar
                                size={56}
                                radius="xl"
                                color="teal"
                            >
                                {user.data.username.slice(0, 1).toUpperCase()}
                            </Avatar>
                            <Stack
                                gap={4}
                                style={{ minWidth: 0 }}
                            >
                                <Title
                                    order={2}
                                    size="h3"
                                    style={{ overflowWrap: "anywhere" }}
                                >
                                    {user.data.username}
                                </Title>
                                <Text
                                    size="sm"
                                    c="dimmed"
                                    style={{ overflowWrap: "anywhere" }}
                                >
                                    Логин: {user.data.login}
                                </Text>
                                <Text
                                    size="sm"
                                    mt="sm"
                                >
                                    У вас общий доступ к накоплениям и покупкам.
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>
                    <Paper
                        withBorder
                        p="xl"
                        radius="lg"
                    >
                        <Stack gap="md">
                            <Title
                                order={2}
                                size="h4"
                            >
                                Оформление
                            </Title>
                            <Text
                                c="dimmed"
                                size="sm"
                            >
                                Выбранная тема сохраняется в этом браузере.
                            </Text>
                            <SegmentedControl
                                aria-label="Тема интерфейса"
                                value={colorScheme === "dark" ? "dark" : "light"}
                                onChange={(value) => {
                                    if (value === "light" || value === "dark") setColorScheme(value);
                                }}
                                data={[
                                    { value: "light", label: "Светлая" },
                                    { value: "dark", label: "Тёмная" },
                                ]}
                            />
                        </Stack>
                    </Paper>
                    <Paper
                        withBorder
                        p="xl"
                        radius="lg"
                    >
                        <Stack align="flex-start">
                            <Title
                                order={2}
                                size="h4"
                            >
                                Сессия
                            </Title>
                            <Text
                                size="sm"
                                c="dimmed"
                            >
                                После выхода для доступа к данным потребуется снова войти.
                            </Text>
                            <FormError error={mutation.error} />
                            <Button
                                variant="light"
                                color="red"
                                leftSection={<IconLogout size={18} />}
                                loading={mutation.isPending}
                                onClick={() => {
                                    if (!mutation.isPending) mutation.mutate();
                                }}
                            >
                                Выйти из аккаунта
                            </Button>
                        </Stack>
                    </Paper>
                </Stack>
            )}
        </>
    );
}
