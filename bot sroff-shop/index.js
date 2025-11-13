import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  REST,
  Routes
} from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// === Définition de la commande /design ===
const commands = [
  new SlashCommandBuilder()
    .setName('design')
    .setDescription('Annonce un nouveau design sur le site SR Off Shop')
    .addStringOption(option =>
      option
        .setName('nom')
        .setDescription('Nom du design')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('Image du design')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

// === Enregistrement des commandes ===
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Enregistrement des commandes slash...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commandes enregistrées avec succès.');
  } catch (error) {
    console.error(error);
  }
})();

// === Gestion des interactions ===
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'design') {
    // 🔒 Vérification de l’utilisateur autorisé
    const ownerId = '1406280211552534684';
    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: "🚫 Tu n'as pas la permission d'utiliser cette commande.",
        ephemeral: true
      });
      return;
    }

    // ✅ Autorisé : exécution normale
    const nom = interaction.options.getString('nom');
    const image = interaction.options.getAttachment('image');
    const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    // 🎨 Embed principal
    const embed = new EmbedBuilder()
      .setTitle(`🆕 Nouveau design ajouté !`)
      .setDescription(
        `Notre boutique [SR Off Shop](https://sroff-shop.myspreadshop.fr/) vient d'ajouter un nouveau design nommé **${nom}** !\n\nDisponible dès aujourd'hui (${date}) 😄`
      )
      .setColor('#00AEEF')
      .setImage(image.url)
      .setTimestamp();

    // 🔘 Bouton "Voir sur le site"
    const button = new ButtonBuilder()
      .setLabel('🛍️ Voir sur le site')
      .setStyle(ButtonStyle.Link)
      .setURL('https://sroff-shop.myspreadshop.fr/');

    const row = new ActionRowBuilder().addComponents(button);

    // ✅ Envoi du message final
    await interaction.reply({ embeds: [embed], components: [row] });
  }
});

client.once('clientReady', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKEN);
