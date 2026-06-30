"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardMetrics, fetchDashboardMetrics } from "@/app/lib/api";

type KpiCard = {
	title: string;
	value: string;
	changeLabel: string;
	changeTone: "positive" | "negative" | "neutral";
	sparkline?: number[];
	accent: string;
};

// The KPI cards are generated dynamically from `metrics`; no hardcoded KPI_CARDS constant is needed.

// When no backend data is available we keep `metrics` null so the UI stays empty until loaded.

function Sparkline({ values, stroke, dashed = false }: { values: number[]; stroke: string; dashed?: boolean }) {
	const width = 180;
	const height = 42;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const points = values
		.map((value, index) => {
			const x = (index / Math.max(values.length - 1, 1)) * width;
			const y = height - ((value - min) / range) * (height - 4) - 2;
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg viewBox={`0 0 ${width} ${height}`} width="100%" height="42" aria-hidden="true">
			<polyline
				fill="none"
				stroke={stroke}
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={dashed ? "7 6" : undefined}
				points={points}
			/>
		</svg>
	);
}

function MetricCard({
	title,
	value,
	changeLabel,
	changeTone,
	sparkline,
	stroke,
	dashed,
}: {
	title: string;
	value: string;
	changeLabel: string;
	changeTone: "positive" | "negative" | "neutral";
	sparkline?: number[];
	stroke?: string;
	dashed?: boolean;
}) {
	const changeColor = changeTone === "negative" ? "#D93025" : changeTone === "positive" ? "#0F9D58" : "#6b7280";

	return (
		<div
			style={{
				border: "1px solid #e0d7ff",
				borderRadius: "20px",
				background: "#ffffff",
				padding: "20px 18px 14px",
				boxShadow: "0 8px 24px rgba(78, 53, 213, 0.06)",
				minHeight: "160px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				boxSizing: "border-box",
			}}
		>
			<div>
				<div style={{ fontSize: "14px", fontWeight: 700, color: "#8A79D4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px" }}>
					{title}
				</div>
				<div style={{ fontSize: "40px", lineHeight: 1, fontWeight: 700, color: "#111827" }}>
					{value}
				</div>
				<div style={{ marginTop: "10px", fontSize: "15px", fontWeight: 600, color: changeColor, display: "flex", alignItems: "center", gap: "8px" }}>
					<span aria-hidden="true">↗</span>
					{changeLabel}
				</div>
			</div>

			{sparkline ? (
				<div style={{ marginTop: "14px", padding: "10px 10px 4px", borderRadius: "14px", background: "#f3efff" }}>
					<Sparkline values={sparkline} stroke={stroke ?? "#4E35D5"} dashed={dashed} />
				</div>
			) : null}
		</div>
	);
}

export default function DashboardStats() {
	// metrics is null until real data is fetched from the backend
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Do not load metrics automatically. Provide a manual action to test backend data.
	const [loading, setLoading] = useState(false);
	const loadMetrics = async () => {
		setError(null);
		setLoading(true);
		try {
			const data = await fetchDashboardMetrics();
			if (!data) {
				// no webhook configured or no data
				setMetrics(null);
				setError("Aucun webhook dashboard configuré côté serveur.");
				setLoading(false);
				return;
			}

			setMetrics(data);
			setError(null);
			setLoading(false);
		} catch (loadError) {
			setMetrics(null);
			setError(loadError instanceof Error ? loadError.message : "Impossible de charger les données n8n.");
			setLoading(false);
		}
	};

	const cards = useMemo(() => {
		if (!metrics) {
			// empty placeholders until backend provides data
			return [
				{ title: "", value: "", changeLabel: "", changeTone: "neutral" as const, sparkline: undefined, accent: "#4E35D5" },
				{ title: "", value: "", changeLabel: "", changeTone: "neutral" as const, sparkline: undefined, accent: "#D93025", dashed: true },
				{ title: "", value: "", changeLabel: "", changeTone: "neutral" as const, accent: "#0F9D58" },
				{ title: "", value: "", changeLabel: "", changeTone: "neutral" as const, accent: "#0F9D58" },
			];
		}

		const m = metrics;
		return [
			{ title: "Volume devis", value: String(m.volumeDevis ?? ""), changeLabel: m.volumeChangeLabel ?? "", changeTone: "positive" as const, sparkline: m.sparklineVolume?.length ? m.sparklineVolume : undefined, accent: "#4E35D5", stroke: "#4E35D5" },
			{ title: "Taux conversion", value: m.conversionRate ? `${m.conversionRate}%` : "", changeLabel: m.conversionChangeLabel ?? "", changeTone: "negative" as const, sparkline: m.sparklineConversion?.length ? m.sparklineConversion : undefined, accent: "#D93025", stroke: "#D93025", dashed: true },
			{ title: "Délai moyen", value: m.averageDelay ?? "", changeLabel: m.averageDelayChangeLabel ?? "", changeTone: "positive" as const, accent: "#0F9D58" },
			{ title: "Devis confirmés", value: String(m.devisConfirmes ?? ""), changeLabel: m.devisConfirmesChangeLabel ?? "", changeTone: "positive" as const, accent: "#0F9D58" },
		];
	}, [metrics]);

	return (
		<main
			style={{
				minHeight: "100%",
				padding: "28px 24px 40px",
				boxSizing: "border-box",
				background: "linear-gradient(180deg, #fbfaff 0%, #ffffff 44%, #fbfafc 100%)",
				fontFamily: "Inter, sans-serif",
				color: "#111827",
			}}
		>
			<div style={{ maxWidth: "1100px", margin: "0 auto" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "end",
						gap: "16px",
						flexWrap: "wrap",
						marginBottom: "18px",
					}}
				>
					<div>
						<div style={{ fontSize: "32px", fontWeight: 700, color: "#111827" }}>{metrics?.title ?? ""}</div>
						<div style={{ fontSize: "18px", fontWeight: 500, color: "#7C6FD6", marginTop: "4px" }}>{metrics?.weekLabel ?? ""}</div>
					</div>
					{metrics ? (
						<div
							style={{
								padding: "12px 16px",
								borderRadius: "16px",
								background: "#f7f4ff",
								border: "1px solid #e0d7ff",
								fontSize: "14px",
								fontWeight: 600,
								color: "#4E35D5",
							}}
						>
							Données connectées au webhook n8n
						</div>
					) : (
						<div>
							<button
								onClick={loadMetrics}
								disabled={loading}
								style={{
									padding: "10px 14px",
									borderRadius: "12px",
									background: "#4E35D5",
									color: "#ffffff",
									border: "none",
									fontSize: "14px",
									fontWeight: 600,
									cursor: loading ? "default" : "pointer",
								}}
							>
								{loading ? "Chargement..." : "Charger données"}
							</button>
						</div>
					)}
				</div>

				{error ? (
					<div
						style={{
							marginBottom: "16px",
							padding: "12px 14px",
							borderRadius: "14px",
							background: "#fff7ed",
							border: "1px solid #fed7aa",
							color: "#9a3412",
							fontSize: "14px",
						}}
					>
						{error}
					</div>
				) : null}

				<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
					{cards.map((card, idx) => (
						<MetricCard
							key={card.title || `kpi-${idx}`}
							{...card}
							value={card.value}
						/>
					))}
				</div>

				<div
					style={{
						marginTop: "26px",
						display: "grid",
						gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 0.9fr)",
						gap: "14px",
					}}
				>
					<div
						style={{
							borderRadius: "18px",
							padding: "20px",
							background: "#ffffff",
							border: "1px solid #ece8ff",
							boxShadow: "0 8px 24px rgba(78, 53, 213, 0.05)",
						}}
					/>

							{/* Graphique principal: volume de devis sur la semaine */}
							<div
								style={{
									borderRadius: "18px",
									padding: "20px",
									background: "#ffffff",
									border: "1px solid #ece8ff",
									boxShadow: "0 8px 24px rgba(78, 53, 213, 0.05)",
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
									<div style={{ fontSize: "16px", fontWeight: 700 }}>Volume devis — 7 derniers jours</div>
									<div style={{ fontSize: "13px", color: "#6b7280" }}>{metrics?.weekLabel ?? ""}</div>
								</div>

								{/* Simple bar chart SVG using sparklineVolume */}
								{(metrics?.sparklineVolume?.length ?? 0) > 0 ? (
									<svg viewBox="0 0 700 220" width="100%" height="220" aria-hidden="true">
										{(() => {
											const vals = metrics!.sparklineVolume;
											const max = Math.max(...vals);
											const min = Math.min(...vals);
											const padding = 20;
											const w = 660;
											const h = 160;
											const barWidth = w / vals.length - 10;
											return (
												<g transform={`translate(${padding},${padding})`}>
													{vals.map((v, i) => {
														const scaled = (v - min) / (max - min || 1);
														const barH = scaled * h;
														const x = i * (barWidth + 10);
														const y = h - barH;
														return (
															<g key={i}>
																<rect x={x} y={y} width={barWidth} height={barH} rx={6} fill="#4E35D5" opacity={0.92} />
																<text x={x + barWidth / 2} y={h + 18} fontSize={12} fill="#6b7280" textAnchor="middle">{`J${i + 1}`}</text>
															</g>
														);
													})}
												</g>
											);
										})()}
									</svg>
								) : (
									<div style={{ padding: "28px", color: "#6b7280" }}>Aucune donnée de volume disponible.</div>
								)}
							</div>

					<div
						style={{
							borderRadius: "18px",
							padding: "20px",
							background: "#fff8e8",
							border: "1px solid #f4c54d",
							boxShadow: "0 8px 24px rgba(217, 153, 0, 0.06)",
						}}
					>
						<div style={{ fontSize: "16px", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
							Alerte visuelle
						</div>
						<div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
							<div style={{ color: "#d97706", fontSize: "20px", lineHeight: 1, marginTop: "1px" }}>⚠</div>
								<div style={{ color: "#111827", fontSize: "15px", fontWeight: 600, lineHeight: 1.55 }}>
									{metrics?.alerts?.[0] ?? "Aucune alerte"}
								</div>
						</div>
					</div>
				</div>

				{/* Branche ici le webhook n8n qui alimente les KPI du dashboard front end. */}
			</div>
		</main>
	);
}