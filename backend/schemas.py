from pydantic import BaseModel

class CityData(BaseModel):
    ''' 
    Represents a city's data vector, pre embedding.

    
    '''
    pass

class Embeddings(BaseModel):
    ''' 
    Represents a city's data vector post embedding. 
    3d vector
    '''
    pass

class CityMeta(BaseModel):
    ''' 
    Represents a city's metadata, including hte output cities.

    
    '''
    pass