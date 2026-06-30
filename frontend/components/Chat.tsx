"use client";

/**
 * Chat.tsx - Chatbot conversationnel + intervention humaine
 * 
 * Système hybride avec deux acteurs:
 * 1. BOT IA (n8n): gère les demandes simples et génère les devis automatiquement
 * 2. AGENT HUMAIN (Neotravel): intervient pour les cas complexes
 * 
 * Flux utilisateur:
 *   User: "Je veux un devis pour un voyage à Bali en juin"
 *   Bot IA: "Merci. Pouvez-vous préciser vos types d'aller?"
 *   User: "Allr-retour
 *   Cas 1 (simple):
 *     Bot IA: "Parfait! Voici votre devis..." + bouton télécharger
 *   
 *   Cas 2 (complexe):
 *     Bot IA: "Cette demande nécessite une intervention humaine."
 *     Agent Humain: "Bonjour, un commercial vous contactera prochainement"
 *     (Chat désactivé - attente du call du commercial)
 */

import { FormEvent, useState } from "react";

import { N8nChatResponse, sendChatPrompt } from "@/app/lib/api";

type ChatMessage = {
	role: "assistant" | "user";
	content: string;
	meta?: N8nChatResponse;
};

function downloadRecap(message: ChatMessage) {
	if (!message.meta?.devisData) {
		return;
	}

	const blob = new Blob([JSON.stringify(message.meta.devisData, null, 2)], { type: "application/json;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "recapitulatif-devis.json";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function MessageDetails({ meta, onDownload, onFillMissing }: { meta?: N8nChatResponse; onDownload?: () => void; onFillMissing?: () => void }) {
	if (!meta) return null;

	const missingInformation = meta.missingInformation ?? [];
	const isComplete = meta.status === "complete" && Boolean(meta.devisData);

	// Cas CAS COMPLEXE ou INTERVENTION HUMAINE REQUISE
	// L'agent IA détecte que le cas dépasse ses capacités (ex: devis personnalisé, négociation)
	// Le système bascule l'affaire à un commercial humain Neotravel
	// Le chat devient lecture seule en attendant le contact humain
	if (meta.caseType === "complex" || meta.humanIntervention) {
		return (
			<div
				style={{
					marginTop: "12px",
					padding: "12px",
					borderRadius: "14px",
					background: "#fff7ed",
					border: "1px solid #f5c6a5",
				}}
			>
				<div style={{ fontSize: "14px", fontWeight: 700, color: "#b45309", marginBottom: "8px" }}>Demande prise en charge par un humain</div>
				<div style={{ fontSize: "14px", color: "#374151", marginBottom: "8px" }}>
					Cette demande nécessite une intervention humaine. Un commercial Neotravel vous contactera prochainement pour finaliser votre dossier.
				</div>
				{meta.humanInterventionReason ? <div style={{ fontSize: "13px", color: "#6b7280" }}>{meta.humanInterventionReason}</div> : null}
			</div>
		);
	}

	return (
		<div
			style={{
				marginTop: "12px",
				padding: "12px",
				borderRadius: "14px",
				background: "rgba(255,255,255,0.7)",
				border: "1px solid rgba(78,53,213,0.12)",
			}}
		>
			<div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#4E35D5", marginBottom: "8px" }}>
				{meta.status}
			</div>

			{missingInformation.length > 0 ? (
				<div style={{ marginBottom: "10px" }}>
					<div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>Informations manquantes</div>
					<ul style={{ margin: 0, paddingLeft: "18px", color: "#374151", lineHeight: 1.45 }}>
						{missingInformation.map((item: string, index: number) => (
							<li key={`${item}-${index}`}>{item}</li>
						))}
					</ul>

					<div style={{ marginTop: "8px" }}>
						<button
							type="button"
							onClick={onFillMissing}
							style={{
								padding: "8px 12px",
								borderRadius: "10px",
								background: "#4E35D5",
								color: "#fff",
								border: "none",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							Remplir ces informations
						</button>
					</div>
				</div>
			) : null}

			{meta.caseType ? (
				<div style={{ marginBottom: "10px", fontSize: "14px", color: "#374151" }}>
					<span style={{ fontWeight: 700 }}>Type de cas :</span> {meta.caseType === "simple" ? "simple" : "complexe"}
				</div>
			) : null}

			{meta.caseType === "simple" ? <div style={{ fontSize: "14px", color: "#0f9d58" }}>{meta.message}</div> : null}

			{isComplete ? (
				<div style={{ marginTop: "12px" }}>
					<div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Récapitulatif du devis</div>
					<div style={{ fontSize: "14px", color: "#374151", lineHeight: 1.45, marginBottom: "10px" }}>{meta.recap?.summary ?? meta.message}</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
						<button
							type="button"
							onClick={onDownload}
							style={{
								height: "38px",
								padding: "0 14px",
								borderRadius: "12px",
								border: "none",
								background: "#4E35D5",
								color: "#ffffff",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							{meta.recap?.downloadLabel ?? "Télécharger le récapitulatif"}
						</button>
						<div style={{ display: "flex", alignItems: "center", fontSize: "14px", color: meta.recap?.emailSent ? "#0f9d58" : "#6b7280" }}>
							{meta.recap?.emailLabel ?? "Envoi mail géré par n8n"}
							{meta.recap?.emailSent ? <span style={{ marginLeft: "8px", fontWeight: 700 }}>envoyé</span> : null}
						</div>
						{meta.recap?.emailSent ? (
							<div style={{ marginTop: "8px", padding: "8px 10px", borderRadius: "8px", background: "#ecfdf5", color: "#065f46", fontSize: "13px" }}>
								Votre devis a été envoyé par mail {meta.recap?.emailTo ? `à ${meta.recap.emailTo}` : ""}.
							</div>
						) : null}
					</div>
				</div>
			) : null}

			{meta.devisData ? (
				<div style={{ marginTop: "10px" }}>
					<div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Données du devis (backend)</div>
					<div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5 }}>
						{Object.entries(meta.devisData).map(([k, v]) => (
							<div key={k} style={{ marginBottom: "6px" }}>
								<span style={{ fontWeight: 700, color: "#111827" }}>{k}:</span>{" "}
								<span style={{ color: "#374151" }}>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}

export default function Chat() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ role: "assistant", content: "Bonjour, je suis votre assistant Neotravel. Partagez votre devis, puis écrivez votre prompt ci-dessous." },
	]);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const content = draft.trim();
		if (!content || loading) {
			return;
		}

		// Ajoute le message utilisateur au chat (conversation libre)
		setMessages((currentMessages) => [...currentMessages, { role: "user", content }]);
		setDraft("");
		setLoading(true);

		try {
			const data = await sendChatPrompt(content);

			// Affiche la réponse du bot dans le chat + métadonnées (champs manquants, devis, etc.)
			setMessages((currentMessages) => [...currentMessages, { role: "assistant", content: data.reply ?? data.message ?? JSON.stringify(data), meta: data }]);
			// Si le bot demande des infos manquantes, la UI affiche les champs et un bouton pour les pré-remplir
			if (data.missingInformation && data.missingInformation.length) {
				// no automatic action, UI shows missing fields; user responds in chat
			}
		} catch {
			setMessages((currentMessages) => [...currentMessages, { role: "assistant", content: "Impossible de joindre le backend. Vérifiez le serveur." }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section
			style={{
				width: "100%",
				height: "100%",
				minHeight: 0,
				display: "flex",
				flexDirection: "column",
				boxSizing: "border-box",
				flex: 1,
				alignSelf: "stretch",
				margin: 0,
				background: "linear-gradient(180deg, #ffffff 0%, #f4f1ff 100%)",
				borderRadius: 0,
				overflow: "hidden",
				boxShadow: "none",
			}}
		>
			<div style={{ width: "100%", padding: "18px 24px 0", color: "#12082E", fontFamily: "Inter, sans-serif", fontSize: "24px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", textAlign: "center", flexShrink: 0 }}>
				Bonjour, obtenez votre <span style={{ fontWeight: 700 }}>devis</span> en <span style={{ color: "#4E35D5" }}>3 minutes</span>
			</div>

			<div style={{ display: "inline-flex", width: "fit-content", height: "20px", minWidth: "96px", padding: "0 12px", justifyContent: "center", alignItems: "center", flexShrink: 0, margin: "0 auto", borderRadius: "6px", background: "var(--style-ffe-8-be, #FFE8BE)", border: "1px solid rgba(18, 8, 46, 0.08)", boxSizing: "border-box", color: "#64748B", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "20px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>
				Décrivez
			</div>

			<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", maxWidth: "760px", margin: "10px auto 0", padding: "0 24px", color: "#1A1A1A", fontFamily: "Inter, sans-serif", fontSize: "20px", fontStyle: "normal", fontWeight: 400, lineHeight: 1.2, textAlign: "center", gap: "4px" }}>
				<div>Décrivez simplement votre besoin dans le chat.</div>
				<div>Notre Agent IA vous guide pas à pas et génère un devis personnalisé.</div>
				<div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 12px", height: "20px", borderRadius: "6px", background: "#BEBEB7", color: "#1A1A1A", whiteSpace: "nowrap", marginTop: "2px" }}>
					instantanément
				</div>
			</div>

			<div style={{ width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
				<div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box" }}>
					{messages.map((message, index) => {
						const isAssistant = message.role === "assistant";

						return (
							<div key={`${message.role}-${index}`} style={{ display: "flex", justifyContent: isAssistant ? "flex-start" : "flex-end" }}>
								<div style={{ maxWidth: "78%", padding: "14px 18px", borderRadius: isAssistant ? "20px 20px 20px 8px" : "20px 20px 8px 20px", background: isAssistant ? "#ffffff" : "#4E35D5", color: isAssistant ? "#1f2937" : "#ffffff", boxShadow: "0 10px 24px rgba(18, 20, 38, 0.08)", border: isAssistant ? "1px solid #ece8ff" : "none", fontSize: "15px", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
									{message.content}
									{message.role === "assistant" ? (
										<MessageDetails
											meta={message.meta}
											onDownload={() => downloadRecap(message)}
											onFillMissing={() => {
												if (!message.meta?.missingInformation) return;
												const template = message.meta.missingInformation.map((m) => `${m}: `).join("\n");
												setDraft((prev) => (prev ? prev + "\n" + template : template));
												// focus input is not available here; user can edit before sending
											}}
										/>
									) : null}
								</div>
							</div>
						);
					})}
				</div>

				<form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", padding: "0 24px 24px", boxSizing: "border-box" }}>
				{/* Champ de saisie simple pour que l'utilisateur écrive sa demande au bot */}
				<input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écrivez votre prompt..." aria-label="Votre prompt" disabled={loading} style={{ flex: 1, minWidth: 0, height: "56px", borderRadius: "18px", border: "1px solid #ddd6fe", background: "#ffffff", padding: "0 18px", fontSize: "16px", color: "#111827", outline: "none", boxSizing: "border-box" }} />
				{/* Bouton d'envoi pour soumettre le message au backend */}
					<button type="submit" disabled={loading} style={{ height: "56px", padding: "0 24px", border: "none", borderRadius: "18px", background: "#4E35D5", color: "#ffffff", fontSize: "16px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1 }}>
						{loading ? "Chargement..." : "Envoyer"}
					</button>
				</form>
			</div>
		</section>
	);
}
