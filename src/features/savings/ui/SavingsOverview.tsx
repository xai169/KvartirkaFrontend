import { Badge, Button, Group, Paper, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { calculateSavingsOverview, type SavingsEntry, type SavingsGoal } from "../model/savings";
import { formatMoney } from "@/shared/lib/money";
import { formatDate } from "@/shared/lib/dates";
import { useCurrentDate } from "@/shared/lib/useCurrentDate";
import classes from "./SavingsOverview.module.css";

export function SavingsOverview({
    goal,
    entries,
    onEdit,
}: {
    goal: SavingsGoal;
    entries: SavingsEntry[];
    onEdit: () => void;
}) {
    const today = useCurrentDate();
    const overview = calculateSavingsOverview(goal, entries, today);
    const status =
        overview.status === "completed"
            ? "Цель достигнута"
            : overview.status === "overdue"
              ? "Срок прошёл"
              : "Идём к цели";
    return (
        <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing="lg"
        >
            <Paper
                withBorder
                p={{ base: "lg", sm: "xl" }}
                radius="lg"
                className={classes.goal}
            >
                <Stack gap="lg">
                    <Group justify="space-between">
                        <Badge
                            variant="light"
                            color={overview.status === "overdue" ? "orange" : "teal"}
                        >
                            {status}
                        </Badge>
                        <Button
                            size="xs"
                            variant="subtle"
                            leftSection={<IconPencil size={15} />}
                            onClick={onEdit}
                        >
                            Изменить цель
                        </Button>
                    </Group>
                    <div>
                        <Text
                            size="sm"
                            c="dimmed"
                            mb={6}
                        >
                            Уже накоплено
                        </Text>
                        <Text
                            className={classes.total}
                            fw={750}
                        >
                            {formatMoney(overview.saved)}
                        </Text>
                        <Text
                            size="sm"
                            c="dimmed"
                            mt={6}
                        >
                            из {formatMoney(goal.targetAmountMinor)}
                        </Text>
                    </div>
                    <div>
                        <Group
                            justify="space-between"
                            mb={8}
                        >
                            <Text
                                size="sm"
                                fw={500}
                            >
                                Прогресс цели
                            </Text>
                            <Text
                                size="sm"
                                fw={700}
                            >
                                {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(overview.percent)}%
                            </Text>
                        </Group>
                        <Progress
                            value={overview.percent}
                            size="md"
                            radius="xl"
                            aria-label="Прогресс цели"
                        />
                    </div>
                    <Group
                        justify="space-between"
                        align="flex-start"
                    >
                        <Stack gap={2}>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Осталось накопить
                            </Text>
                            <Text fw={650}>{formatMoney(overview.remaining)}</Text>
                        </Stack>
                        <Stack gap={2}>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Цель до
                            </Text>
                            <Text
                                fw={500}
                                size="sm"
                            >
                                {formatDate(goal.targetDate)}
                            </Text>
                        </Stack>
                    </Group>
                    {overview.overTarget > 0n && (
                        <Text
                            c="teal"
                            size="sm"
                        >
                            Сверх цели: {formatMoney(overview.overTarget)}
                        </Text>
                    )}
                </Stack>
            </Paper>
            <Paper
                withBorder
                p={{ base: "lg", sm: "xl" }}
                radius="lg"
            >
                <Stack gap="lg">
                    <div>
                        <Title
                            order={2}
                            size="h4"
                        >
                            План на месяц
                        </Title>
                        <Text
                            size="sm"
                            c="dimmed"
                            mt={4}
                            tt="capitalize"
                        >
                            {formatDate(today, true)}
                        </Text>
                    </div>
                    <div>
                        <Text
                            size="sm"
                            c="dimmed"
                        >
                            Осталось внести в этом месяце
                        </Text>
                        <Text
                            className={classes.monthTotal}
                            fw={750}
                            mt={6}
                        >
                            {formatMoney(overview.monthRemaining)}
                        </Text>
                    </div>
                    <SimpleGrid cols={2}>
                        <Stack gap={4}>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                План месяца
                            </Text>
                            <Text fw={650}>{formatMoney(overview.required)}</Text>
                        </Stack>
                        <Stack gap={4}>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Уже внесено
                            </Text>
                            <Text
                                fw={650}
                                c="teal"
                            >
                                {formatMoney(overview.current)}
                            </Text>
                        </Stack>
                    </SimpleGrid>
                    <Text
                        size="sm"
                        c={overview.monthAhead > 0n ? "teal" : "dimmed"}
                    >
                        {overview.monthAhead > 0n
                            ? `Вы опережаете план на ${formatMoney(overview.monthAhead)}`
                            : overview.monthRemaining === 0n
                              ? "План месяца выполнен. Отличный шаг к общей цели!"
                              : "Каждое пополнение приближает вас к цели. План учитывает накопления за предыдущие месяцы."}
                    </Text>
                </Stack>
            </Paper>
        </SimpleGrid>
    );
}
