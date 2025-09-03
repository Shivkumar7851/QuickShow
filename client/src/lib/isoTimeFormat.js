const isoTimeFormat = (dateTime) =>{
    const date = new Date(dateTime);
    const localTime = date.toLocaleTimeString('en-US',{
        hour: '2-digit',
        mimute:'2-digit',
        hour12:true,
    });
    return localTime;
}

export default isoTimeFormat;