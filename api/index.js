const express = require('express');
const app = require('express')();
const PORT = 8080;

app.use(express.json())
app.listen(
	PORT,
	() => console.log('its alive on http://localhost:')
	);
app.get('/GuildMembers',(req, res)=>{
	res.status(200).send({
		DiscordName: 'Chmar#123',
		DiscordNick: 'Gstring',
		CharName: 'Gstring'
	})
});

app.post("/GuildMembers/:id", (req, res)=>{
	const{ id }=req.params;
	const{ serverId }=req.body;

	if (!serverId) {
		res.status(418).send({message: "We need a serverId!"})
	}

});